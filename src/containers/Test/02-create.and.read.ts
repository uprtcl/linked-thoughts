import { TextNode, TextType } from '@uprtcl/documents';
import { Section } from '../types';
import { InitializeElements } from './01-initialize';

const PAGE_TITLE = 'Page title';
const PARS = ['Par1', 'Par2', 'Par3'];

export class CreateAndRead extends InitializeElements {
  private pageId: string;

  async updatePage() {
    this.logger.log('updatePage()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    this.pageId = privateSectionData.object.pages[0];

    await this.create();
    await this.read();
  }

  async create() {
    await this.evees.updatePerspectiveData({
      perspectiveId: this.pageId,
      object: {
        text: PAGE_TITLE,
        type: TextType.Title,
        links: [],
      },
    });

    await Promise.all(
      PARS.map(async (par) => {
        await this.evees.addNewChild(this.pageId, {
          text: par,
          type: TextType.Paragraph,
          links: [],
        });
      })
    );

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
