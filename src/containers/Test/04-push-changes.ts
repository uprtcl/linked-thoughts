import { TextNode, TextType } from '@uprtcl/documents';
import { EveesEvents } from '@uprtcl/evees';
import { PublishToBlog } from './03-publish.to.blog';

const SUBSECTION_TITLE = 'Subtitle 1';
const SUBPAR_TEXT = 'Sub paragraph text';

export class PushChanges extends PublishToBlog {
  async updateAndPublish() {
    this.logger.log('updateAndPublish()');

    await this.updateAndPush();
  }

  async updateAndPush() {
    // updade the document
    const editor = this.dashboard.docPage.documentEditor;

    await editor.contentChanged(editor.doc.childrenNodes[2], {
      type: TextType.Title,
      links: [],
      text: SUBSECTION_TITLE,
    });
    await editor.split(editor.doc.childrenNodes[2], '', true);
    await editor.contentChanged(editor.doc.childrenNodes[2].childrenNodes[0], {
      type: TextType.Paragraph,
      links: [],
      text: SUBPAR_TEXT,
    });

    // wait for the debounce
    await new Promise<void>((resolve) => {
      this.evees.events.on(EveesEvents.pending, (pending) => {
        if (!pending) resolve();
      });
    });

    // reload forks of the docPage component
    await this.dashboard.docPage.loadForks();

    // check the diff includes the expected changes
    const eveesPush = this.dashboard.docPage.eveesPush;

    const diff = await eveesPush.diff();

    if (diff.newPerspectives.length !== 1) {
      this.logger.error(`push changes wrong`, { diff });
    }

    if (diff.updates.length !== 1) {
      this.logger.error(`push changes wrong`, { diff });
    }

    /** push the pending changes */
    await this.dashboard.docPage.pushChanges();

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
