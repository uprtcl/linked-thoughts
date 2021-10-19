import { TextNode, TextType } from '@uprtcl/documents';
import { EveesEvents } from '@uprtcl/evees';

import { CreatePage } from './05-create.page-2';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class UpdateAndRead2 extends CreatePage {
  async updateAndReadPage2() {
    this.logger.log('updatePage()');

    await this.updateDoc2();
    this.logger.log('updateDoc() - done');

    await this.read2();
    this.logger.log('read() - done');

    // await this.clearAndRead();
    // this.logger.log('clearAndRead() - done');
  }

  private async updateDoc2() {
    await this.dashboard.docPage.loadingPromise;
    await this.dashboard.docPage.updateComplete;

    const editor = this.dashboard.docPage.documentEditor;
    await editor.loadingPromise;

    const par3 = editor.doc.childrenNodes[1].childrenNodes[0].childrenNodes[1];

    const asHeader = { ...par3.draft, type: TextType.Title };

    // convert to header
    await editor.contentChanged(par3, asHeader, true);

    // add child
    await editor.split(par3, '', true);

    // write on child
    await editor.contentChanged(
      par3.childrenNodes[0],
      { text: 'new subpar', type: TextType.Paragraph, links: [] },
      false
    );

    // convert child to header
    await editor.contentChanged(
      par3.childrenNodes[0],
      { text: 'new subpar', type: TextType.Title, links: [] },
      false
    );

    // add child to child
    await editor.split(par3.childrenNodes[0], '', true);

    // write on child of child
    await editor.contentChanged(
      par3.childrenNodes[0].childrenNodes[0],
      { text: 'new subpar subpar', type: TextType.Paragraph, links: [] },
      false
    );

    // update par3
    const awaiting = this.awaitPending();
    await editor.contentChanged(
      par3,
      { ...par3.draft, text: par3.draft.text + ' uupp' },
      false
    );
    await awaiting;

    await this.dashboard.appManager.commitUnder(editor.doc.uref);
  }

  private async read2() {
    const pageData = await this.evees.getPerspectiveData<TextNode>(this.pageId);
  }
}
