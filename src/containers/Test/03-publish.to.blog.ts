import { TextNode } from '@uprtcl/documents';
import { Section } from '../types';
import { CreateAndRead } from './02-create.and.read';

export class PublishToBlog extends CreateAndRead {
  async publishToBlog() {
    this.logger.log('publishToBlog()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.hash
    );

    const pageId = privateSectionData.object.pages[0];

    const pageData = await this.evees.getPerspectiveData<TextNode>(pageId);

    // fork of page
    await this.appManager.createForkOn(pageId, this.blogSection.hash);

    // assert
    const forks = await this.appManager.getForkedInMine(pageId);
    const pageFork = forks.find(
      (fork) => fork.parentId === this.blogSection.hash
    );

    if (pageFork === undefined) {
      this.logger.error(
        `fork of ${pageId} on ${this.blogSection.hash} not found`,
        { forks }
      );
    }

    // forks of paragraphs
    await Promise.all(
      pageData.object.links.map(async (par) => {
        const parForks = await this.appManager.getForkedInMine(par);
        if (
          parForks.find((fork) => fork.parentId === pageFork.childId) ===
          undefined
        ) {
          this.logger.error(`fork of ${par} not correct`, { parForks });
        }
      })
    );
  }
}
