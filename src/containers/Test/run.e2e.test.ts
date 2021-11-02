import { Logger } from '@uprtcl/evees';
import { UpdatedAndRead3 } from './08-update.and.read-3';

export class AppTestElement extends UpdatedAndRead3 {
  logger = new Logger('Test');

  async firstUpdated() {
    await super.firstUpdated();
    this.run();
  }

  async run() {
    this.logger.log('run()');

    this.state = 'initializing appManager';
    await this.initializeElements(Date.now());

    console.clear();

    this.logger.log(`nonce: ${this.homeNonce}`);

    this.state = 'updating page';
    await this.updateAndReadPage1();

    // this.state = 'publishToBlog';
    // await this.publishToBlog();

    // this.state = 'updateAndPush';
    // await this.updateAndPush();

    // this.state = 'createPage';
    // await this.createPage2();

    // this.state = 'createPage';
    // await this.publishToBlog();

    // this.state = 'updating page';
    // await this.updateAndReadPage2();

    // this.state = 'createPage';
    // await this.createPage3();

    // // this.state = 'updating page';
    // await this.updateAndReadPage2();

    this.state = 'finished';
  }
}
