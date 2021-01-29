import { html, css, internalProperty, LitElement } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';

import { EveesHttp } from '@uprtcl/evees-http';
import { Router } from '@vaadin/router';

import { Home } from '../constants/routeNames';
import { ConnectedElement } from '../services/connected.element';

export class GettingStartedElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  remote: EveesHttp;

  async firstUpdated() {
    this.remote = this.evees.getRemote() as EveesHttp;
    await (this.remote.connection as any).checkLoginCallback();
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      Router.go(Home);
    }

    this.loading = false;
  }

  async login() {
    await this.remote.login();
    this.isLogged = await this.remote.isLogged();
    Router.go(Home);
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    this.logger.log('rendering wiki after loading');

    return html`
      <uprtcl-button @click=${() => this.login()} class="">
        login
      </uprtcl-button>
    `;
  }

  static get styles() {
    return [
      styles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
        }
      `,
    ];
  }
}
