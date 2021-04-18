import { html, css, property } from 'lit-element';

import { MenuOptions } from '@uprtcl/common-ui';

import { ConnectedElement } from '../../../services/connected.element';
import { BlockViewType } from '../collection.base';

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

  @property({ type: String, attribute: 'view' })
  viewType: BlockViewType;

  actionOptions: MenuOptions = new Map();

  renderItem() {
    switch (this.viewType) {
      case BlockViewType.gridCard:
        return html`<app-item-grid-card
          uref=${this.uref}
          ui-parent=${this.uiParent}
          .actionOptions=${this.actionOptions}
        ></app-item-grid-card>`;

      case BlockViewType.tableRow:
        return html`<app-item-table-row
          uref=${this.uref}
          ui-parent=${this.uiParent}
          .actionOptions=${this.actionOptions}
        ></app-item-table-row>`;

      case BlockViewType.pageFeedItem:
        return html`<app-item-page-feed
          uref=${this.uref}
          ui-parent=${this.uiParent}
          .actionOptions=${this.actionOptions}
        ></app-item-page-feed>`;
    }
  }

  render() {
    return html`<div
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
