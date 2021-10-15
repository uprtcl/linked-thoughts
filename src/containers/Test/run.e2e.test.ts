import { Logger } from '@uprtcl/evees';
import { CreateAndRead2 } from './06-update.and.read-2';

export class AppTestElement extends CreateAndRead2 {
  logger = new Logger('Test');

  async firstUpdated() {
    await super.firstUpdated();
    this.run();
  }

  async run() {
    this.logger.log('run()');

    this.state = 'initializing appManager';
    await this.initializeElements(Date.now());

    // this.state = 'updating page';
    // await this.updateAndReadPage1();

    // this.state = 'publishToBlog';
    // await this.publishToBlog();

    // this.state = 'updateAndPush';
    // await this.updateAndPush();

    this.state = 'createPage';
    await this.createPage();

    this.state = 'createPage';
    await this.publishToBlog();

    // // this.state = 'updating page';
    // await this.updateAndReadPage2();

    this.state = 'finished';
  }
}
