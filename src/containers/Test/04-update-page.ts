import { TextNode, TextType } from '@uprtcl/documents';
import { PublishToBlog } from './03-publish.to.blog';

const SUBSECTION_TITLE = 'Subtitle 1';
const SUBPAR_TEXT = 'Sub paragraph text';

export class UpdatePage extends PublishToBlog {
  async updateAndPublish() {
    this.logger.log('updateAndPublish()');

    await this.updateAndPush();
  }

  async updateAndPush() {
    // convert paragraph to title
    const pageData = await this.evees.getPerspectiveData<TextNode>(this.pageId);
    const parId = pageData.object.links[2];
    const parData: TextNode = {
      type: TextType.Title,
      links: [],
      text: SUBSECTION_TITLE,
    };

    await this.evees.updatePerspectiveData({
      perspectiveId: parId,
      object: parData,
    });

    // add new sub-paragraph
    await this.evees.addNewChild(parId, {
      type: TextType.Paragraph,
      links: [],
      text: SUBPAR_TEXT,
    });

    // compute push
    const eveesPush = await this.appManager.compareForks(
      this.forkId,
      this.pageId
    );

    const diff = await eveesPush.diff();

    if (diff.newPerspectives.length !== 1) {
      this.logger.error(`push changes wrong`, { diff });
    }

    if (diff.updates.length !== 1) {
      this.logger.error(`push changes wrong`, { diff });
    }

    /** commit changes made locally */
    await this.appManager.commitUnder(this.pageId);

    /** flush changes made to the fork */
    await eveesPush.flush({
      start: { elements: [{ id: this.forkId }] },
    });

    // check changes were merged on the fork
    const forkData = await this.evees.getPerspectiveData<TextNode>(this.forkId);
    const parForkData = await this.evees.getPerspectiveData<TextNode>(
      forkData.object.links[2]
    );

    if (
      parForkData.object.type !== TextType.Title &&
      parForkData.object.text !== SUBSECTION_TITLE &&
      parForkData.object.links.length !== 1
    ) {
      this.logger.error(`fork data wrong`, { diff });
    }

    const subParForkData = await this.evees.getPerspectiveData<TextNode>(
      parForkData.object.links[0]
    );

    if (
      subParForkData.object.type !== TextType.Paragraph &&
      subParForkData.object.text !== SUBPAR_TEXT &&
      subParForkData.object.links.length !== 0
    ) {
      this.logger.error(`fork data wrong`, { diff });
    }
  }
}
