import { html, css, internalProperty, LitElement } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';

import { EveesHttp } from '@uprtcl/evees-http';
import { Router } from '@vaadin/router';

import { Home } from '../constants/routeNames';
import { ConnectedElement } from '../services/connected.element';
import { AUTH0_CONNECTION, ETH_ACCOUNT_CONNECTION } from '../services/init';

export class GettingStartedElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  hasWeb3 = false;

  remote: EveesHttp;

  async firstUpdated() {
    this.hasWeb3 = window['ethereum'] !== undefined;
    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      Router.go(Home);
    }

    this.loading = false;
  }

  async login(connectionId: string) {
    this.remote.connection.select(connectionId);
    const connection = this.remote.connection.connection();
    await connection.login();

    this.isLogged = await this.remote.isLogged();
    Router.go(Home);
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <uprtcl-button @click=${() => this.login(AUTH0_CONNECTION)} class="">
        login auth0
      </uprtcl-button>
      <uprtcl-button
        ?disabled=${!this.hasWeb3}
        @click=${() => this.login(ETH_ACCOUNT_CONNECTION)}
        class=""
      >
        login web3
      </uprtcl-button>
      ${!this.hasWeb3
        ? html`<a target="_blank" href="https://metamask.io/">rabit hole</a>`
        : ''}
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
          justify-content: center;
          align-items: center;
        }
        uprtcl-button {
          width: 300px;
          margin: 16px 0px 6px 0px;
        }
      `,
    ];
  }
}
