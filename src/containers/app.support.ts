import { TextType } from '@uprtcl/documents';
import { Evees, Perspective, Secured } from '@uprtcl/evees';
import { EveesHttp } from '@uprtcl/evees-http';
import { App } from 'src/app';

/** a tree of perspectives that is apended to
 * the home space of the logged user. This server creates this
 * tree of perspectives and offers methods to navigate it */
export interface AppElement {
  path: string;
  getInitData?: (children?: AppElement[]) => any;
  perspective?: Secured<Perspective>;
  children?: AppElement[];
}
/** the relative (to home) path of each app element */
export class AppSupport {
  readonly remote: EveesHttp;

  constructor(protected evees: Evees, protected home: AppElement) {
    this.remote = this.evees.findRemote('http') as EveesHttp;
  }

  async check(): Promise<void> {
    /** home space perspective is deterministic */
    this.home.perspective = await this.remote.getHome();
    await this.checkOrCreatePerspective(this.home.perspective);

    /** all other objects are obtained relative to the home perspective */
    await this.getOrCreateElementData(this.home);
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
    }
  }

  async getOrCreateElementData(element: AppElement) {
    const data = await this.evees.getPerspectiveData(element.perspective.id);
    if (!data) {
      await this.initTree(element);
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
}
