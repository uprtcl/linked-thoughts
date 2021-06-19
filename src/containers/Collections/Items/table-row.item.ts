import { html, css, property, internalProperty } from 'lit-element';
import { Entity, Perspective, Secured } from '@uprtcl/evees';
import { MenuOptions } from '@uprtcl/common-ui';

import { ConnectedElement } from '../../../services/connected.element';
import { sharedStyles } from '../../../styles';

import {
  GenerateDocumentRoute,
  GenerateUserRoute,
} from '../../../utils/routes.helpers';
import { TimestampToDate } from '../../../utils/date';
import { tableStyles } from '../table.styles';

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

    this.data = await this.evees.getPerspectiveData(this.uref);
    this.perspective = await this.evees.getEntity(this.uref);

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
      <div class="table-cell title">
        <a href=${GenerateDocumentRoute(this.uref)} target="_blank">
          ${this.title}
        </a>
      </div>
      <div class="table-cell date">
        ${TimestampToDate(this.perspective.object.payload.timestamp)}
      </div>
      <div class="table-cell location">
        <a
          href=${GenerateUserRoute(this.perspective.object.payload.creatorId)}
          target="_blank"
        >
          ${this.perspective.object.payload.creatorId}
        </a>
      </div>
    `;
  }

  static get styles() {
    return [
      sharedStyles,
      tableStyles,
      css`
        :host {
          display: flex;
        }
      `,
    ];
  }
}
