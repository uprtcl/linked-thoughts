import { MenuOptions } from '@uprtcl/common-ui';
import { html, css, property } from 'lit-element';

import { ConnectedElement } from '../../../services/connected.element';
import { BlockViewType } from '../collection.base';

export class BlockItem extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @property({ type: String, attribute: 'view' })
  viewType: BlockViewType;

  actionOptions: MenuOptions = new Map();

  render() {
    switch (this.viewType) {
      case BlockViewType.gridCard:
        return html`<app-item-grid-card
          uref=${this.uref}
          .actionOptions=${this.actionOptions}
        ></app-item-grid-card>`;

      case BlockViewType.tableRow:
        return html`<app-item-table-row
          uref=${this.uref}
          .actionOptions=${this.actionOptions}
        ></app-item-table-row>`;
    }
  }

  static get styles() {
    return [css``];
  }
}
