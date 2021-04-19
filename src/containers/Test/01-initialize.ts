import { Section } from '../types';
import { TestBaseElement } from './00-base.component';

export class InitializeElements extends TestBaseElement {
  async initializeElements() {
    this.logger.log('initializeElements()');
    await this.appManager.init();

    this.privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.blogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    if (privateSectionData.object.pages.length !== 1) {
      this.error = 'private page not created';
      throw new Error();
    }
  }
}
