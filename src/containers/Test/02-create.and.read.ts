import { DocumentEditor, TextNode, TextType } from '@uprtcl/documents';
import { AsyncQueue } from '@uprtcl/evees';
import { query } from 'lit-element';

import { Section } from '../types';
import { TestBaseElement } from './00-base.component';
import { InitializeElements } from './01-initialize';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class CreateAndRead extends InitializeElements {
  async updateAndReadPage() {
    this.logger.log('updatePage()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.hash
    );

    this.pageId = privateSectionData.object.pages[0];

    this.logger.log(`Page id: ${this.pageId}`);

    await this.updateDoc();
    // await this.read();
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

    // await this.evees.flush();
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

        if (parData.object.text !== PARS.reverse()[ix]) {
          throw new Error(`unexpected`);
        }
      })
    );
  }
}
