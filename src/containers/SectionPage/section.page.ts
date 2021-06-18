import { html, internalProperty, LitElement, property } from 'lit-element';
import { servicesConnect } from '@uprtcl/evees-ui';

import { APP_MANAGER } from '../../services/init';
import { AppManager } from '../../services/app.manager';

import {
  BlockViewType,
  CollectionConfig,
  HeaderViewType,
} from '../Collections/collection.base';
import { ThoughtsTextNodeType } from 'src/services/app.elements.patterns';

export class SectionPage extends servicesConnect(LitElement) {
  @property({ type: String })
  uref: string;

  @internalProperty()
  title: string;

  @internalProperty()
  itemsTitle: string;

  @internalProperty()
  config: CollectionConfig;

  appManager!: AppManager;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }

  async firstUpdated() {
    const privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );

    const blogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );

    const forksSection = await this.appManager.elements.get(
      '/linkedThoughts/forksSection'
    );

    if (this.uref === privateSection.hash) {
      this.title = 'Private';
      this.itemsTitle = 'My Private Pages';
    }

    if (this.uref === blogSection.hash) {
      this.title = 'Blog';
      this.itemsTitle = 'My Blog Pages';
    }

    if (this.uref === forksSection.hash) {
      this.title = 'Forks';
      this.itemsTitle = 'My Forks';
    }

    this.config = {
      title: this.title,
      itemsTitle: this.itemsTitle,
      blockView: BlockViewType.gridCard,
      headerView: HeaderViewType.section,
      itemConfig: {
        showActions: true,
        showDate: false,
        showAuthor: false,
      },
    };
  }

  render() {
    const actionOptions = new Map();
    actionOptions.set('remove', { text: 'Remove' });
    actionOptions.set('copyToClipboard', { text: 'Add to Clipboard' });

    return html`<app-evees-data-collection
      uref=${this.uref}
      .config=${this.config}
      .actionOptions=${actionOptions}
    />`;
  }
  static get styles() {
    return [];
  }
}
