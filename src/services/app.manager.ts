import { TextNode, TextType } from '@uprtcl/documents';
import { AppElement, AppElements, Evees } from '@uprtcl/evees';
import { EveesHttp, PermissionType } from '@uprtcl/evees-http';

import { Dashboard } from '../containers/types';

export class AppManager {
  elements: AppElements;

  constructor(protected evees: Evees, appElementsInit: AppElement) {
    this.elements = new AppElements(evees, appElementsInit);
  }

  async checkStructure() {
    /** check the app scheleton is there */
    await this.elements.check();
    await this.checkBlogPermissions();
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

  async newPage(onSectionId: string) {
    const page: TextNode = {
      text: '',
      type: TextType.Title,
      links: [],
    };
    await this.evees.addNewChild(page, onSectionId);

    await this.evees.client.flush();
  }

  /**  */
  async forkPage(pageId: string, onSectionId): Promise<string> {
    const forkId = await this.evees.forkPerspective(
      pageId,
      undefined,
      onSectionId
    );
    await this.evees.addExistingChild(forkId, onSectionId);
    await this.evees.client.flush();
    return forkId;
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
  async getForkedIn(pageId: string): Promise<string[]> {
    const locations = await this.evees.client.searchEngine.locate(pageId, true);
    return locations;
  }
}
