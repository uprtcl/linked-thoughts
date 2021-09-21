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

export class CreateAndRead extends InitializeElements {
  async updateAndReadPage() {
    console.clear();

    this.logger.log('updatePage()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.hash
    );

    this.pageId = privateSectionData.object.pages[0];

    this.logger.log(`Page id: ${this.pageId}`);

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
    // await editor.split(editor.doc.childrenNodes[1], PARS[2], false);

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

    if (pageData.object.text !== PAGE_TITLE) {
      throw new Error(`unexpected`);
    }

    if (pageData.object.links.length !== 2) {
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

  /** Delete all memory and local entities and evees data */
  async deleteLocal() {
    this.logger.log('deleteLocal() - start');
    localStorage.clear();

    /** clear memory and local eveess */
    const memoryEvees = this.evees.getClient() as ClientMutationMemory;
    const localEvees = memoryEvees.base as ClientMutationLocal;

    await memoryEvees.mutationStore.clear();
    await localEvees.mutationStore.clear();

    /** clear memory and local entities stores */
    const memoryEntities = (this.evees.entityResolver as any).cache;
    await memoryEntities.clear();

    const localEntities = (localEvees.mutationStore as MutationStoreLocal)
      .entityCache as EntityRemoteLocal;

    await localEntities.db.entities.clear();
    this.logger.log('deleteLocal() - done');
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
