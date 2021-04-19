import { TextType } from '@uprtcl/documents';
import { Section } from '../types';
import { InitializeElements } from './01-initialize';

export class CreateAndRead extends InitializeElements {
  async updatePage() {
    this.logger.log('updatePage()');
    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    const pageId = privateSectionData.object.pages[0];

    await this.evees.updatePerspectiveData({
      perspectiveId: pageId,
      object: {
        text: 'Page title',
        type: TextType.Title,
        links: [],
      },
    });

    await this.evees.addNewChild(pageId, {
      text: 'par 1',
      type: TextType.Title,
      links: [],
    });

    await this.evees.addNewChild(pageId, {
      text: 'par 2',
      type: TextType.Title,
      links: [],
    });

    await this.evees.addNewChild(pageId, {
      text: 'par 3',
      type: TextType.Title,
      links: [],
    });

    await this.evees.flush();
  }
}
