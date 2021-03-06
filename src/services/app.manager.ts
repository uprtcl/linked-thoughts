import { TextNode, TextType } from '@uprtcl/documents';
import {
  AppElement,
  AppElements,
  Evees,
  ParentAndChild,
  RecursiveContextMergeStrategy,
  getConceptPerspective,
  Secured,
  Perspective,
  getHome,
  SearchOptions,
  SearchResult,
} from '@uprtcl/evees';
import { EveesHttp, PermissionType } from '@uprtcl/evees-http';
import { AppError } from './app.error';
import { Dashboard, Section } from '../containers/types';

export enum ConceptId {
  BLOGHOME = 'bloghome',
  BLOGPOST = 'blogpost',
}

export class AppManager {
  elements: AppElements;
  appError: AppError;

  constructor(protected evees: Evees, appElementsInit: AppElement) {
    this.elements = new AppElements(evees, appElementsInit);
    this.appError = new AppError();
  }

  async getConcept(conceptId: ConceptId): Promise<Secured<Perspective>> {
    switch (conceptId) {
      case ConceptId.BLOGHOME:
      case ConceptId.BLOGPOST:
        return getConceptPerspective(conceptId);
    }
  }

  async checkStructure() {
    /** check the app scheleton is there */
    await this.elements.check();
    await this.checkBlogPermissions();
  }

  /** init blog ACL to publicRead privateWrite (HTTP-remote-specific)
   *  verify blog concept is linked to the blog section
   */
  async checkBlogPermissions() {
    const blogSection = await this.elements.get('/linkedThoughts/blogSection');

    const remote = this.evees.getRemote() as EveesHttp;
    await remote.accessControl.toggleDelegate(blogSection.id, false);
    await remote.accessControl.setPublicPermissions(
      blogSection.id,
      PermissionType.Read,
      true
    );

    // check or associate the blog section with the BLOGHOME concept
    const blogHomeConcept = await this.getConcept(ConceptId.BLOGHOME);

    // get the current Section data of the blog section
    const blogSectionData = await this.evees.getPerspectiveData<Section>(
      blogSection.id
    );

    if (
      blogSectionData.object.meta === undefined ||
      blogSectionData.object.meta.isA === undefined ||
      !blogSectionData.object.meta.isA.includes(blogHomeConcept.id)
    ) {
      // append the bloghome concept
      const isAOrg = blogSectionData.object.meta
        ? blogSectionData.object.meta.isA
        : [];
      const isANew = isAOrg.concat([blogHomeConcept.id]);

      const blogDataNew: Section = {
        ...blogSectionData.object,
        meta: {
          isA: isANew,
        },
      };

      /** update the section data (adding the link) */
      await this.evees.updatePerspectiveData(blogSection.id, blogDataNew);
      await this.evees.client.flush();
    }
  }

  async newPage(onSectionId: string): Promise<string> {
    const page: TextNode = {
      text: '',
      type: TextType.Title,
      links: [],
    };
    const childId = await this.evees.addNewChild(onSectionId, page);
    await this.evees.client.flush();

    return childId;
  }

  /**  */
  async forkPage(
    pageId: string,
    onSectionId: string,
    flush: boolean = true
  ): Promise<string> {
    const forkId = await this.evees.forkPerspective(
      pageId,
      undefined,
      onSectionId
    );
    await this.evees.addExistingChild(forkId, onSectionId);

    if (flush) {
      await this.evees.client.flush();
    }

    return forkId;
  }

  async getBlogFeed(
    offset: number,
    first: number,
    text?: string,
    userId?: string
  ): Promise<SearchResult> {
    const blogConcept = await this.getConcept(ConceptId.BLOGPOST);
    const userHome = userId
      ? await getHome(this.evees.getRemote(), userId)
      : undefined;

    const result = await this.evees.client.searchEngine.explore(
      {
        under: userHome ? [{ id: userHome.id }] : undefined,
        linksTo: [{ id: blogConcept.id }],
        pagination: {
          offset,
          first,
        },
        text: text
          ? {
              value: text,
              levels: -1,
            }
          : undefined,
      },
      {
        entities: true,
        levels: 0,
      }
    );
    return result;
  }

  // TODO: TEST: find another user's blogs to simulate follows
  async getBlogIdOf(userId: string): Promise<string | undefined> {
    const userHome = await getHome(this.evees.getRemote(), userId);
    const blogHomeConcept = await this.getConcept(ConceptId.BLOGHOME);

    const result = await this.evees.client.searchEngine.explore({
      under: [{ id: userHome.id }],
      linksTo: [{ id: blogHomeConcept.id }],
    });

    if (result.perspectiveIds.length > 1) {
      throw Error(
        `Unexpected number ${result.perspectiveIds.length} of blog perspectives under user ${userId}`
      );
    }
    return result.perspectiveIds.length >= 1
      ? result.perspectiveIds[0]
      : undefined;
  }

  async getSections(): Promise<string[]> {
    const dashboardPerspective = await this.elements.get('/linkedThoughts');
    const dashboardData = await this.evees.getPerspectiveData<Dashboard>(
      dashboardPerspective.id
    );
    return dashboardData.object.sections;
  }

  /** find all the sections where other perspectives of a page have been
   * created */
  async getForkedIn(pageId: string): Promise<ParentAndChild[]> {
    const locations = await this.evees.client.searchEngine.locate(pageId, true);
    return locations;
  }

  /** returns an Evees service with its state modified with the effect of the merge */
  async compareForks(to: string, from: string): Promise<Evees> {
    const config = {
      forceOwner: true,
    };

    // Create a temporary workspaces to compute the merge
    const evees = this.evees.clone();
    const merger = new RecursiveContextMergeStrategy(evees);
    await merger.mergePerspectivesExternal(to, from, config);

    return evees;
  }

  async workspaceHasChanges(evees: Evees) {
    // see if the temporary workspaces has updated any perspective
    const diff = await evees.client.diff();
    return diff.updates ? diff.updates.length > 0 : false;
  }
}
