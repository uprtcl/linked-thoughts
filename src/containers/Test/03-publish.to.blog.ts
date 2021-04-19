import { TextNode } from '@uprtcl/documents';
import { Section } from '../types';
import { CreateAndRead } from './02-create.and.read';

export class PublishToBlog extends CreateAndRead {
  async publishToBlog() {
    this.logger.log('publishToBlog()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    const pageId = privateSectionData.object.pages[0];

    const pageData = await this.evees.getPerspectiveData<TextNode>(pageId);

    // fork of page
    await this.appManager.createForkOn(pageId, this.blogSection.id);

    // assert
    const forks = await this.appManager.getForkedIn(pageId);
    if (forks.length !== 1) {
      this.logger.error(`fork of ${pageId} not correct`, { forks });
    }

    // forks of paragraphs
    await Promise.all(
      pageData.object.links.map(async (par) => {
        const parForks = await this.appManager.getForkedIn(par);
        if (parForks.length !== 1) {
          this.logger.error(`fork of ${par} not correct`, { parForks });
        }
      })
    );
  }
}
