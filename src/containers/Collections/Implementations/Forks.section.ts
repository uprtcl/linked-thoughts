import lodash from 'lodash';
import { internalProperty } from 'lit-element';
import { Logger } from '@uprtcl/evees';

import { CollectionBaseElement } from '../collection.base';

export class ForksPage extends CollectionBaseElement {
  logger = new Logger('ForksPage');

  @internalProperty()
  allForksIds: string[] = [];

  async firstUpdated() {
    this.actionOptions = new Map();
    this.actionOptions.set('remove', { text: 'remove' });
    this.actionOptions.set('copyToClipboard', { text: 'Add to Clipboard' });

    await this.load();
    await super.firstUpdated();
  }

  async load() {
    this.loading = true;
    const forksSection = await this.appManager.elements.get(
      '/linkedThoughts/forksSection'
    );
    const data = await this.evees.getPerspectiveData(forksSection.id);

    this.allForksIds = data.object.pages;
    this.loading = false;
  }

  async getMoreItems(): Promise<string[]> {
    const forksLength = this.itemIds.length;
    if (forksLength >= this.allForksIds.length) {
      return [];
    }

    return lodash.slice(this.allForksIds, forksLength, forksLength + 4);
  }

  static get styles() {
    return [...super.styles];
  }
}
