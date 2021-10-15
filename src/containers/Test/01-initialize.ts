import { query } from 'lit-element';

import { DashboardElement } from '../dashboard';
import { Section } from '../types';
import { TestBaseElement } from './00-base.component';

export class InitializeElements extends TestBaseElement {
  homeNonce: number;

  async initializeElements(nonce?: number) {
    this.logger.log('initializeElements()');

    const isLogged = await this.remote.isLogged();

    if (!isLogged) {
      this.state = 'logging in';
      await this.login();
    }

    if (nonce) this.homeNonce = nonce;

    await this.appManager.init(this.homeNonce);

    this.privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.blogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.hash
    );

    this.initializing = false;
    await this.updateComplete;

    await this.dashboard.loadingPromise;
    await this.updateComplete;

    this.pageId = privateSectionData.object.pages[0];
    this.logger.log(`Page id: ${this.pageId}`);
  }
}
