import { html, css, property } from 'lit-element';

import { MenuOptions } from '@uprtcl/common-ui';

import { ConnectedElement } from '../../../services/connected.element';
import { BlockViewType } from '../collection.base';

export enum BlockAction {
  remove = 'remove',
  addToClipboard = 'addToClipboard',
}

/** a base component with common functions for all block item components */
export class BlockItemBase extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @property({ type: String, attribute: 'ui-parent' })
  uiParent: string;

  actionOptions: MenuOptions = new Map();

  async remove() {
    const ix = await this.evees.getChildIndex(this.uiParent, this.uref);
    this.evees.removeChild(this.uiParent, ix);
  }

  handleAction(action: BlockAction) {
    switch (action) {
      case BlockAction.remove:
        this.remove();
        break;

      default:
        throw new Error(`Unexpected action ${action}`);
    }
  }

  static get styles() {
    return [css``];
  }
}
