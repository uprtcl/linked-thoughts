import { html, css, internalProperty, query } from 'lit-element';
import { EveesHttp } from '@uprtcl/evees-http';
import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';
import { HttpMultiConnection } from '@uprtcl/http-provider';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import { ETH_ACCOUNT_CONNECTION } from '../../services/init';
import { Perspective } from '@uprtcl/evees';
import { Secured } from '@uprtcl/evees';

export class TestBaseElement extends ConnectedElement {
  logger = new Logger('Test');

  @internalProperty()
  loading = true;

  @internalProperty()
  state: string = 'initializing';

  @internalProperty()
  error: string = '';

  remote: EveesHttp;

  privateSection!: Secured<Perspective>;
  blogSection!: Secured<Perspective>;

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async firstUpdated() {
    this.error = '';
    this.remote = this.evees.getRemote();
  }

  async login() {
    const connectionId = ETH_ACCOUNT_CONNECTION;
    const multiConnection: HttpMultiConnection = this.remote.connection as any;

    multiConnection.select(connectionId);
    const connection = multiConnection.connection();

    await connection.login();
  }

  render() {
    return html`<div
        class=${`callout state ${this.state === 'finished' ? 'success' : ''}`}
      >
        ${this.state}
      </div>
      ${this.error ? html`<div class="callout error">${this.error}</div>` : ''}`;
  }

  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .callout {
          border: 2px solid black;
          padding: 1rem;
          width: 250px;
          border-radius: 5px;
          margin-bottom: 12px;
          box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        }
        .error {
          color: red;
          border-color: red;
        }
        .success {
          color: green;
          border-color: green;
        }
      `,
    ];
  }
}
