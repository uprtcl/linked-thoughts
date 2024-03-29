import { TextNode, TextType } from '@uprtcl/documents';

import { InitializeElements } from './01-initialize';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class UpdatedAndRead extends InitializeElements {
  async updateAndReadPage1() {
    this.logger.log('updatePage()');

    await this.updateDoc1();
    this.logger.log('updateDoc1() - done');

    await this.read1();
    this.logger.log('read1() - done');

    await this.clearAndRead1();
    this.logger.log('clearAndRead() - done');
  }

  private async updateDoc1() {
    await this.dashboard.docPage.loadingPromise;
    await this.dashboard.docPage.updateComplete;

    const editor = this.dashboard.docPage.documentEditor;
    await editor.loadingPromise;

    const content: TextNode = {
      text: PAGE_TITLE,
      type: TextType.Title,
      links: [],
    };

    await editor.contentChanged(editor.doc, content);
    await editor.split(editor.doc, PARS[0], true);
    await editor.split(editor.doc.childrenNodes[0], PARS[1], false);
    await editor.split(editor.doc.childrenNodes[1], PARS[2], false);

    /** editor changes are applied asynchronously. We now need to wait for them to
     * be fully executed (applied on the top-layer on mutation Client) */
    await this.awaitPending();
  }

  private async read1() {
    const pageData = await this.evees.getPerspectiveData<TextNode>(this.pageId);

    if (pageData.object.text !== PAGE_TITLE) {
      throw new Error(`unexpected`);
    }

    if (pageData.object.links.length !== 3) {
      throw new Error(`unexpected`);
    }

    await Promise.all(
      pageData.object.links.map(async (par, ix) => {
        const parData = await this.evees.getPerspectiveData<TextNode>(par);

        if (parData.object.text !== PARS[ix]) {
          throw new Error(`unexpected`);
        }
      })
    );
  }

  async clearAndRead1() {
    /** await for flush into local storage to occur */
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    /** flush local storage to backend */
    await this.appManager.commitUnder(this.pageId);

    await this.deleteLocal();
    await this.initializeElements();
    await this.read1();
  }
}
