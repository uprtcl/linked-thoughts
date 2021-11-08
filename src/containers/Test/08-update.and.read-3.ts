import { TextNode, TextType } from '@uprtcl/documents';

import { InitializeElements } from './01-initialize';
import { CreatePage3 } from './07-create.page-3';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class UpdatedAndRead3 extends CreatePage3 {
  async updateAndReadPage3() {
    // TEST TO BE MADE
    // console.clear();
    // this.logger.log('updatePage()');
    // await this.updateDoc3();
    // this.logger.log('updateDoc() - done');
    // await this.read3();
    // this.logger.log('read() - done');
  }

  private async updateDoc3() {
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

  private async read3() {
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
}
