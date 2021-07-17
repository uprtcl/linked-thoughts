import { TextNode, TextType } from '@uprtcl/documents';
import { AsyncQueue } from '@uprtcl/evees';

import { Section } from '../types';
import { TestBaseElement } from './00-base.component';
import { InitializeElements } from './01-initialize';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class CreateAndRead extends InitializeElements {
  private updateQueue = new AsyncQueue();

  async createAndReadPage() {
    this.logger.log('updatePage()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.hash
    );

    this.pageId = privateSectionData.object.pages[0];

    this.logger.log(`Page id: ${this.pageId}`);

    await this.create();
    await this.read();
  }

  async create() {
    await this.evees.flush();
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
