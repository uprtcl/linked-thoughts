import { TextNode, TextType } from '@uprtcl/documents';
import { EveesEvents } from '@uprtcl/evees';
import { PublishToBlog } from './03-publish.to.blog';

const SUBSECTION_TITLE = ['Subtitle 3', 'Subtitle 2', 'Subtitle 1'];
const SUBPAR_TEXT = [
  'Sub paragraph text 3',
  'Sub paragraph text 2',
  'Sub paragraph text 1',
];

export class PushChanges extends PublishToBlog {
  async updateAndPublish() {
    this.logger.log('updateAndPublish()');

    await this.updateAndPush();
  }

  async updateAndPush() {
    // updade the document
    const editor = this.dashboard.docPage.documentEditor;

    // par3 converted to title
    const par3 = editor.doc.childrenNodes[2];
    await editor.contentChanged(par3, {
      type: TextType.Title,
      links: [],
      text: SUBSECTION_TITLE[0],
    });
    await editor.split(par3, '', true);

    await editor.contentChanged(par3.childrenNodes[0], {
      type: TextType.Paragraph,
      links: [],
      text: SUBPAR_TEXT[0],
    });

    // par2 converted to title
    const par2 = editor.doc.childrenNodes[1];
    await editor.contentChanged(par2, {
      type: TextType.Title,
      links: [],
      text: SUBSECTION_TITLE[1],
    });
    await editor.split(par2, '', true);

    await editor.contentChanged(par2.childrenNodes[0], {
      type: TextType.Paragraph,
      links: [],
      text: SUBPAR_TEXT[1],
    });

    // par1 converted to title
    const par1 = editor.doc.childrenNodes[0];
    await editor.contentChanged(par1, {
      type: TextType.Title,
      links: [],
      text: SUBSECTION_TITLE[2],
    });
    await editor.split(par1, '', true);

    await editor.contentChanged(par1.childrenNodes[0], {
      type: TextType.Paragraph,
      links: [],
      text: SUBPAR_TEXT[2],
    });

    // wait for the debounce
    const awaiting = this.awaitPending();
    await awaiting;

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
      parForkData.object.text !== SUBSECTION_TITLE[1] &&
      parForkData.object.links.length !== 1
    ) {
      this.logger.error(`fork data wrong`, { diff });
    }

    const subParForkData = await this.evees.getPerspectiveData<TextNode>(
      parForkData.object.links[0]
    );

    if (
      subParForkData.object.type !== TextType.Paragraph &&
      subParForkData.object.text !== SUBPAR_TEXT[0] &&
      subParForkData.object.links.length !== 0
    ) {
      this.logger.error(`fork data wrong`, { diff });
    }
  }
}
