import { TextNode } from '@uprtcl/documents';
import { Section } from '../types';
import { CreateAndRead } from './02-create.and.read';

export class PublishToBlog extends CreateAndRead {
  async publishToBlog() {
    this.logger.log('publishToBlog()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.hash
    );

    const pageData = await this.evees.getPerspectiveData<TextNode>(this.pageId);

    // fork of page
    await this.appManager.createForkOn(this.pageId, this.blogSection.hash);

    // assert
    const forks = await this.appManager.getForkedInMine(this.pageId);
    const pageFork = forks.find(
      (fork) => fork.parentId === this.blogSection.hash
    );

    if (pageFork === undefined) {
      this.logger.error(
        `fork of ${this.pageId} on ${this.blogSection.hash} not found`,
        { forks }
      );
    }

    this.forkId = pageFork.childId;

    // forks of paragraphs
    await Promise.all(
      pageData.object.links.map(async (par) => {
        const parForks = await this.appManager.getForkedInMine(par);
        if (
          parForks.find((fork) => fork.parentId === this.forkId) === undefined
        ) {
          this.logger.error(`fork of ${par} not correct`, { parForks });
        }
      })
    );
  }
}
