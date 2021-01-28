import { TextType } from '@uprtcl/documents';
import {
  Entity,
  Evees,
  PartialPerspective,
  Perspective,
  Secured,
  Signed,
} from '@uprtcl/evees';
import { EveesHttp } from '@uprtcl/evees-http';
import { Dashboard, Home, Section } from './types';

/** a tree of perspectives that is apended to
 * the home space of the logged user. This server creates this
 * tree of perspectives and offers methods to navigate it */
export interface AppElement {
  path: string;
  getInitData?: (children?: AppElement[]) => any;
  perspective?: Secured<Perspective>;
  children?: AppElement[];
}

const appElementsInit: AppElement = {
  path: '/',
  getInitData: (children: AppElement[]) => {
    return { linkedThoghts: children[0].perspective.id };
  },
  children: [
    {
      path: '/linkedThoughts',
      getInitData: (children: AppElement[]) => {
        return { sections: children.map((child) => child.perspective.id) };
      },
      children: [
        { path: '/privateSection', children: [{ path: '/firstPage' }] },
        { path: '/blogSection' },
      ],
    },
  ],
};

/** the relative (to home) path of each app element */
export class AppSupport {
  readonly remote: EveesHttp;
  readonly home: AppElement = appElementsInit;

  constructor(protected evees: Evees) {
    this.remote = this.evees.findRemote('http') as EveesHttp;
  }

  /** Returns the appElement from the path */
  getElement(path: string): AppElement {
    let thisElement = this.home;

    let childElements = thisElement.children;
    const pathSections = path.split('/');

    while (pathSections.length > 0) {
      const thisPath = pathSections.pop();
      thisElement = childElements.find((e) => {
        const path = e.path.split('/')[1];
        return path === thisPath;
      });
      if (!thisElement) {
        throw new Error('Element not found at path');
      }
      childElements = thisElement.children;
    }

    return thisElement;
  }

  async checkOrCreateElement(path: string) {
    /** home space perspective is deterministic */
    if (path === '/') {
      this.home.perspective = await this.remote.getHome();
      await this.checkOrCreatePerspective(this.home.perspective);
      return;
    }

    /** all other objects are obtained relative to the home perspective */
    const homeData = await this.evees.getPerspectiveData(
      this.home.perspective.id
    );

    if (!homeData) {
      this.initTree(this.home);
    }
  }

  async createSnapElementRec(element: AppElement) {
    element.perspective = await this.remote.snapPerspective({});
    await Promise.all(
      element.children.map((child) => this.createSnapElementRec(child))
    );
  }

  async initPerspectiveDataRec(element: AppElement) {
    const data = element.getInitData(element.children);
    this.evees.updatePerspectiveData(element.perspective.id, data);

    await Promise.all(
      this.home.children.map((child) => this.initPerspectiveDataRec(child))
    );
  }

  // make sure a perspective exist, or creates it
  async checkOrCreatePerspective(perspective: Secured<Perspective>) {
    const { details } = await this.evees.client.getPerspective(perspective.id);

    /** canUpdate is used as the flag to detect if the home space exists */
    if (!details.canUpdate) {
      /** create the home perspective as it did not existed */
      const id = await this.evees.createEvee({
        partialPerspective: perspective.object.payload,
      });

      if (id !== this.home.id) {
        throw new Error('Undexpected id for home perspective');
      }
    }
  }

  async initTree(element: AppElement) {
    // Create perspectives from top to bottom
    if (element.children) {
      // snap all perspectives
      await Promise.all(
        element.children.map((child) => this.createSnapElementRec(child))
      );

      // set perspective data
      await this.initPerspectiveDataRec(this.home);
    }

    await this.evees.client.flush();
  }

  private async checkElement(path: string): Promise<void> {
    const element = this.getElement(path);

    /** if the perspective is not set, we need to check if the element exist */
    if (!element.perspective) {
      const { details } = await this.evees.client.getPerspective(this.home.id);

      /** canUpdate is used as the flag to detect if the home space exists */
      if (!details.canUpdate) {
        /** create the home perspective as it did not existed */
        const id = await this.evees.createEvee({
          partialPerspective: this.home.perspective.object.payload,
        });

        if (id !== this.home.id) {
          throw new Error('Undexpected id for home perspective');
        }
      }
    }
  }

  async createElementPerspective(path: string) {
    const { element, parent } = this.getElement(path);

    element.perspective = perspective;
  }

  /** Returns the perspective that represents the LinkedThoughts space of the
   * logged user. LinkedThoughts objects are stored under the user home perspective as
   * home.object.linkedThoughs */
  async getDashboardPerspective(): Promise<Secured<Perspective>> {
    /** to arrive to the dashboard, we need to start from the home perspective */
    const home = await this.getHomePerspective();

    let homeData: Entity<Home> | undefined = undefined;
    // check if the home data exist and has a linkedThoughts property
    try {
      homeData = await this.evees.getPerspectiveData<Home>(home.id);
    } catch (e) {
      /** its ok, if the data does not exists, we will create it now */
    }

    let dashboardId: string;

    // if it does not have linkedThoughts property, then create it
    if (!!homeData && homeData.object.linkedThoughts) {
      dashboardId = homeData.object.linkedThoughts;
    } else {
      dashboardId = await this.createDashboard();

      // now update the homeData with the linkedThoughts property set
      const homeDataInit: Home = {
        linkedThoughts: dashboardId,
      };
      await this.evees.updatePerspectiveData(home.id, homeDataInit);
    }

    return this.evees.client.store.getEntity<Signed<Perspective>>(dashboardId);
  }

  private async createDashboard(): Promise<string> {
    /** to arrive to the dashboard, we need to start from the home perspective */
    const home = await this.getHomePerspective();

    const dashboardData: Dashboard = {
      sections: [],
    };

    return this.evees.addNewChild(dashboardData, home.id);
  }

  async getSection(index: number): Promise<Entity<Section>> {
    /** to arrive to the section, we need to start from the dashboard */
    const dashboard = await this.getDashboardPerspective();

    let dashboardData: Entity<Dashboard> | undefined = undefined;

    // check if the dashboard data exist and has a sections property
    try {
      dashboardData = await this.evees.getPerspectiveData<Dashboard>(
        dashboard.id
      );
    } catch (e) {
      /** its ok, if the data does not exists, we will create it now */
    }

    let sectionId: string;

    // if it does not have sections property, then create it
    if (
      !!dashboardData &&
      dashboardData.object.sections &&
      index < dashboardData.object.sections.length - 1
    ) {
      sectionId = dashboardData.object.sections[0];
    } else {
      sectionId = await this.createSection(index);
    }

    return this.evees.client.store.getEntity<Section>(sectionId);
  }

  private async createSection(index: number) {
    /** to arrive to the dashboard, we need to start from the home perspective */
    const dashboard = await this.getDashboardPerspective();

    const sectionData: Section = {
      sections: [],
    };

    return this.evees.addNewChild(dashboardData, home.id);
  }
}
