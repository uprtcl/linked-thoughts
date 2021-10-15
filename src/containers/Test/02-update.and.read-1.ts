import { DocumentEditor, TextNode, TextType } from '@uprtcl/documents';
import {
  AsyncQueue,
  ClientMutationLocal,
  ClientMutationMemory,
  EntityRemoteLocal,
  EveesEvents,
  MutationStoreLocal,
} from '@uprtcl/evees';

import { Section } from '../types';
import { InitializeElements } from './01-initialize';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class UpdatedAndRead extends InitializeElements {
  async updateAndReadPage1() {
    console.clear();

    this.logger.log('updatePage()');

    await this.updateDoc();
    this.logger.log('updateDoc() - done');

    await this.read();
    this.logger.log('read() - done');

    await this.clearAndRead();
    this.logger.log('clearAndRead() - done');
  }

  async updateDoc() {
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

  async read() {
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
