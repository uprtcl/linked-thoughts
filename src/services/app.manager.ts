import { TextNode, TextType } from '@uprtcl/documents';
import { AppElement, AppElements, Evees } from '@uprtcl/evees';
import { EveesHttp, PermissionType } from '@uprtcl/evees-http';
import lodash from 'lodash';
import { PageShareMeta } from 'src/containers/types';

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

  async getShareMeta(pageId: string): Promise<PageShareMeta> {
    const privateSection = await this.elements.get(
      '/linkedThoughts/privateSection'
    );
    const blogSection = await this.elements.get('/linkedThoughts/blogSection');

    const ixInPrivate = await this.evees.getChildIndex(
      privateSection.id,
      pageId
    );
    const ixInBlog = await this.evees.getChildIndex(blogSection.id, pageId);

    const inSections = [];
    if (ixInPrivate !== -1) inSections.push(privateSection.id);
    if (ixInBlog !== -1) inSections.push(blogSection.id);

    return {
      inPrivate: ixInPrivate != -1,
      inSections,
    };
  }

  /**  */
  async toggleSharePage(pageId: string) {
    const privateSection = await this.elements.get(
      '/linkedThoughts/privateSection'
    );
    const blogSection = await this.elements.get('/linkedThoughts/blogSection');

    const shareMeta = await this.getShareMeta(pageId);

    if (lodash.includes(shareMeta.inSections, blogSection.id)) {
      /** unshare */
      const blogSectionData = await this.evees.getPerspectiveData(
        blogSection.id
      );

      lodash.remove(blogSectionData.object.pages, (id) => id === pageId);

      await this.evees.updatePerspectiveData(
        blogSection.id,
        blogSectionData.object,
        undefined,
        privateSection.id
      );
    } else {
      /**
       * Share
       */
      await this.evees.moveChild(
        pageId,
        privateSection.id,
        blogSection.id,
        0,
        true,
        false
      );
    }
  }
}
