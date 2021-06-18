import { html, css, property } from 'lit-element';

import { MenuOptions } from '@uprtcl/common-ui';

import { ConnectedElement } from '../../../services/connected.element';
import { BlockViewType, CollectionConfig } from '../collection.base';

export enum BlockActions {
  remove = 'remove',
  addToClipboard = 'addToClipboard',
}

/** a component that dynamically renders a block component based on the BlockViewType */
export class BlockItemRouter extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @property({ type: String, attribute: 'ui-parent' })
  uiParent: string;

  @property({ type: Object })
  config: CollectionConfig;

  actionOptions: MenuOptions = new Map();

  renderItem() {
    switch (this.config.blockView) {
      case BlockViewType.gridCard:
        return html`<app-item-grid-card
          uref=${this.uref}
          ui-parent=${this.uiParent}
          .config=${this.config}
          .actionOptions=${this.actionOptions}
        ></app-item-grid-card>`;

      case BlockViewType.tableRow:
        return html`<app-item-table-row
          uref=${this.uref}
          ui-parent=${this.uiParent}
          .config=${this.config}
          .actionOptions=${this.actionOptions}
        ></app-item-table-row>`;

      case BlockViewType.pageFeedItem:
        return html`<app-item-page-feed
          uref=${this.uref}
          ui-parent=${this.uiParent}
          .config=${this.config}
          .actionOptions=${this.actionOptions}
        ></app-item-page-feed>`;
    }
  }

  /** height must be fixed to keep infinite scroll under control */
  getHeight() {
    switch (this.config.blockView) {
      case BlockViewType.gridCard:
        return '160px';

      case BlockViewType.tableRow:
        return '40px';

      case BlockViewType.pageFeedItem:
        return '400px';
    }
  }

  render() {
    return html`<div
      class="item-wrapper"
      style="${`height: ${this.getHeight()}`}"
      draggable="true"
      @dragstart=${(ev) => {
        ev.dataTransfer.setData(
          'text/plain',
          JSON.stringify({ uref: this.uref })
        );
      }}
    >
      ${this.renderItem()}
    </div>`;
  }

  static get styles() {
    return [css``];
  }
}
