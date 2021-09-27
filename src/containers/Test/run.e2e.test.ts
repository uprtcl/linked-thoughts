import { Logger } from '@uprtcl/evees';

import { CreatePage } from './05-create.page';

export class AppTestElement extends CreatePage {
  logger = new Logger('Test');

  async firstUpdated() {
    await super.firstUpdated();
    this.run();
  }

  async run() {
    this.logger.log('run()');

    this.state = 'initializing appManager';
    await this.initializeElements(Date.now());

    this.state = 'updating page';
    await this.updateAndReadPage();

    this.state = 'publishToBlog';
    await this.publishToBlog();

    this.state = 'updateAndPush';
    await this.updateAndPush();

    this.state = 'createPage';
    await this.createPage();

    this.state = 'finished';
  }
}
