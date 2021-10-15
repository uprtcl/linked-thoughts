import { html, css, internalProperty, query } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { HttpMultiConnection } from '@uprtcl/http-provider';
import {
  Logger,
  Secured,
  Perspective,
  ClientMutationLocal,
  ClientMutationMemory,
  EntityRemoteLocal,
  MutationStoreLocal,
  EveesEvents,
} from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import { ETH_ACCOUNT_CONNECTION } from '../../services/init';
import {
  RouteBase,
  RouteName,
  RouterGoEvent,
  ROUTER_GO_EVENT,
} from '../../router/routes.types';
import { DashboardElement } from '../dashboard';

export class TestBaseElement extends ConnectedElement {
  logger = new Logger('Test');

  @internalProperty()
  loading = true;

  @internalProperty()
  state: string = 'initializing';

  @internalProperty()
  error: string = '';

  remote: any;

  @internalProperty()
  pageId: string;

  @internalProperty()
  forkId: string;

  @internalProperty()
  initializing: boolean = true;

  @query(`#dashboard`)
  dashboard: DashboardElement;

  privateSection!: Secured<Perspective>;
  blogSection!: Secured<Perspective>;
  initNonce = Date.now();

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener(ROUTER_GO_EVENT, (event: RouterGoEvent) => {
      event.stopPropagation();

      if (event.detail.name !== RouteName.dashboard_page) {
        throw new Error('Tests only suppor reroute to page for now');
      }

      this.logger.log('router go event', { event });

      this.pageId = event.detail.params.pageId;
    });
  }

  async firstUpdated() {
    this.logger.log(`Test nonce: ${this.initNonce}`);
    this.error = '';
    this.remote = this.evees.getRemote() as any;
  }

  async login() {
    const connectionId = ETH_ACCOUNT_CONNECTION;
    const multiConnection: HttpMultiConnection = this.remote.base.connection;

    multiConnection.select(connectionId);
    const connection = multiConnection.connection();

    await connection.login();
  }

  /** Delete all memory and local entities and evees data */
  async deleteLocal() {
    this.logger.log('deleteLocal() - start');
    // localStorage.clear();

    /** clear memory and local eveess */
    const memoryEvees = this.evees.getClient() as ClientMutationMemory;
    const localEvees = memoryEvees.base as ClientMutationLocal;

    await memoryEvees.mutationStore.clear();
    await localEvees.mutationStore.clear();

    /** clear memory and local entities stores */
    const memoryEntities = (this.evees.entityResolver as any).cache;
    await memoryEntities.clear();

    const localEntities = (localEvees.mutationStore as MutationStoreLocal)
      .entityCache as EntityRemoteLocal;

    await localEntities.db.entities.clear();
    this.logger.log('deleteLocal() - done');
  }

  async awaitPending() {
    const editor = this.dashboard.docPage.documentEditor;

    await new Promise<void>((resolve) => {
      editor.evees.events.on(EveesEvents.pending, (pending: boolean) => {
        if (!pending) {
          resolve();
        }
      });
    });
  }

  render() {
    return html`<div
        class=${`callout state ${this.state === 'finished' ? 'success' : ''}`}
      >
        ${this.state}
      </div>
      ${this.initializing
        ? html`<uprtcl-loading></uprtcl-loading>`
        : html`<app-dashboard 
          id="dashboard" 
          .location=${{
            name: RouteName.dashboard_page,
            params: { pageId: this.pageId },
          }} initNonce=${this.initNonce}></app-dashboard></div>`}
      ${this.state === 'finished'
        ? html`<div class="callout">
            <ul>
              <li>
                <a
                  href=${`${RouteBase.dashboard_page}/${this.pageId}`}
                  target="_blank"
                  >page</a
                >
              </li>
              <li>
                <a
                  href=${`${RouteBase.dashboard_page}/${this.forkId}`}
                  target="_blank"
                  >fork</a
                >
              </li>
            </ul>
          </div>`
        : ''}
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
