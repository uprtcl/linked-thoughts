import { Logger } from '@uprtcl/evees';

import { PublishToBlog } from './03-publish.to.blog';

export class AppTestElement extends PublishToBlog {
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
    await this.updatePage();

    this.state = 'publishToBlog';
    await this.publishToBlog();

    this.loading = false;
    this.state = 'finished';
  }
}
