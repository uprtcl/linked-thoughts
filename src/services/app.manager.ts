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
} from '@uprtcl/evees';
import { EveesHttp, PermissionType } from '@uprtcl/evees-http';
import { AppError } from './app.error';
import { Dashboard } from '../containers/types';

export enum ConceptId {
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
      case ConceptId.BLOGPOST:
        return getConceptPerspective(conceptId);
    }
  }

  async checkStructure() {
    /** check the app scheleton is there */
    await this.elements.check();
    await this.checkBlogPermissions();
    // TODO: Is it necessary to check or Create the blog concept perspective?
  }

  /** init blog ACL to publicRead privateWrite (HTTP-remote-specific) */
  async checkBlogPermissions() {
    const blogSection = await this.elements.get('/linkedThoughts/blogSection');
    const remote = this.evees.getRemote() as EveesHttp;
    await remote.accessControl.toggleDelegate(blogSection.id, false);
    await remote.accessControl.setPublicPermissions(
      blogSection.id,
      PermissionType.Read,
      true
    );
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

  async getBlogFeed(): Promise<string[]> {
    const blogConcept = await this.getConcept(ConceptId.BLOGPOST);
    const result = await this.evees.client.searchEngine.explore({
      linksTo: [{ id: blogConcept.id }],
    });
    return result.perspectiveIds;
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
