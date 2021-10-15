import { TextNode, TextType } from '@uprtcl/documents';
import { EveesEvents } from '@uprtcl/evees';

import { CreatePage } from './05-create.page';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class CreateAndRead2 extends CreatePage {
  async updateAndReadPage2() {
    console.clear();

    this.logger.log('updatePage()');

    await this.updateDoc();
    this.logger.log('updateDoc() - done');

    await this.read();
    this.logger.log('read() - done');

    // await this.clearAndRead();
    // this.logger.log('clearAndRead() - done');
  }

  async updateDoc() {
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
    await editor.contentChanged(
      par3,
      { ...par3.draft, text: par3.draft.text + ' uupp' },
      false
    );

    /** editor changes are applied asynchronously. We now need to wait for them to
     * be fully executed (applied on the top-layer on mutation Client) */
    await new Promise<void>((resolve) => {
      editor.evees.events.on(EveesEvents.pending, (pending: boolean) => {
        if (!pending) {
          resolve();
        }
      });
    });
  }

  async read() {
    const pageData = await this.evees.getPerspectiveData<TextNode>(this.pageId);
  }

  async clearAndRead() {
    /** await for flush into local storage to occur */
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    /** flush local storage to backend */
    await this.appManager.commitUnder(this.pageId);

    await this.deleteLocal();
    await this.initializeElements();
    this.read();
  }
}
