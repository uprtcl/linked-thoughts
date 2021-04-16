import { html, css, property, internalProperty } from 'lit-element';
import { Entity, Perspective, Secured } from '@uprtcl/evees';
import { MenuOptions } from '@uprtcl/common-ui';

import { ConnectedElement } from '../../../services/connected.element';
import { sharedStyles, tableStyles } from '../../../styles';

import {
  GenerateDocumentRoute,
  GenerateUserRoute,
} from '../../../utils/routes.helpers';
import { TimestampToDate } from '../../../utils/date';

export class TableRowItem extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @internalProperty()
  loading: boolean = true;

  actionOptions: MenuOptions = new Map();

  title: string;

  data: Entity;
  perspective: Secured<Perspective>;

  async firstUpdated() {
    await this.load();
  }

  async load() {
    this.loading = true;

    this.data = await this.appManager.draftsEvees.getPerspectiveData(this.uref);
    this.perspective = await this.appManager.draftsEvees.client.store.getEntity(
      this.uref
    );

    this.title = this.evees.behaviorFirst(this.data.object, 'title');

    this.loading = false;
  }

  handleAction(option: string) {
    this.dispatchEvent(
      new CustomEvent('action-selected', {
        composed: true,
        bubbles: true,
        detail: { uref: this.uref, option },
      })
    );
  }

  render() {
    if (this.loading) {
      return html`<evees-loading></evees-loading>`;
    }

    return html`
      <div class="table_small">
        <a href=${GenerateDocumentRoute(this.uref)} target="_blank">
          <div class="table_cell">${this.title}</div>
        </a>
      </div>
      <div class="table_small">
        <div class="table_cell">
          ${TimestampToDate(this.perspective.object.payload.timestamp)}
        </div>
      </div>
      <div class="table_small">
        <div class="table_cell">
          <a
            href=${GenerateUserRoute(this.perspective.object.payload.creatorId)}
            target="_blank"
          >
            ${this.perspective.object.payload.creatorId}
          </a>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      sharedStyles,
      tableStyles,
      css`
        :host {
          font-family: 'Inter';
          height: 100%;
          display: table-row;
        }

        .cont {
          padding-top: 1rem;
          padding-bottom: 1.5rem;
          position: relative;
        }
        .type-label {
          background: #a37c17aa;
          width: fit-content;
          padding: 2px 5px;
          font-size: 0.8rem;
          font-weight: 600;

          color: #fafafa;
        }
        .type-image {
          background: #a37c17aa;
        }
        .type-title {
          background: #576cce;
        }
        .type-paragraph {
          background: #822699;
        }
        .description {
          color: #828282;
          font-size: 1rem;
        }
        .card-content {
          min-height: 120px;
        }
        .card-footer {
        }
        .description img {
          max-height: 100px;
        }
        .author {
          font-family: Poppins;
          font-style: normal;
          font-weight: 500;
          font-size: 13px;
          line-height: 19px;
          /* identical to box height */
          color: #de5163;
        }
        .actions {
          margin-top: 0.25rem;
          display: flex;
          color: #9797aa;
          bottom: 0;
        }
        .actions > * {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 3%;
          font-size: 0.9rem;
        }
        .actions span {
          margin-left: 0.25rem;
        }
        .list-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        .list-row-title {
          flex: 1;
        }
      `,
    ];
  }
}
