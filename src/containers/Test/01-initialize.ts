import { query } from 'lit-element';

import { DashboardElement } from '../dashboard';
import { Section } from '../types';
import { TestBaseElement } from './00-base.component';

export class InitializeElements extends TestBaseElement {
  @query(`#dashboard`)
  dashboard: DashboardElement;

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

    if (privateSectionData.object.pages.length !== 1) {
      this.error = 'private page not created';
      throw new Error();
    }

    this.initializing = false;
    await this.updateComplete;

    await this.dashboard.loadingPromise;
    await this.updateComplete;
  }
}
