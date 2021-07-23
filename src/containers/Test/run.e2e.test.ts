import { Logger } from '@uprtcl/evees';

import { UpdatePage } from './04-update-page';

export class AppTestElement extends UpdatePage {
  logger = new Logger('Test');

  async firstUpdated() {
    await super.firstUpdated();
    this.run();
  }

  async run() {
    this.logger.log('run()');
    const isLogged = await this.remote.isLogged();

    if (!isLogged) {
      this.state = 'logging in';
      await this.login();
    }

    this.state = 'initializing appManager';
    await this.initializeElements();

    this.state = 'updating page';
    await this.updateAndReadPage();

    this.state = 'publishToBlog';
    await this.publishToBlog();

    this.state = 'updateAndPush';
    await this.updateAndPush();

    this.state = 'finished';
  }
}
