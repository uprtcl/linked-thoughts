import lodash from 'lodash';
import { internalProperty, property } from 'lit-element';
import { LinkingBehaviorNames, Logger } from '@uprtcl/evees';

import { CollectionBaseElement } from '../collection.base';

/** a collection whose items are children elements of an evee */
export class EveesDataCollection extends CollectionBaseElement {
  logger = new Logger('ForksPage');

  @property()
  uref: string;

  @internalProperty()
  allItemsIds: string[] = [];

  async firstUpdated() {
    await this.load();
    await super.firstUpdated();
  }

  async load() {
    this.loading = true;
    const data = await this.evees.getPerspectiveData(this.uref);
    const children = this.evees.behaviorConcat(
      data.object,
      LinkingBehaviorNames.CHILDREN
    );
    this.allItemsIds = children;
    this.loading = false;
  }

  async getMoreItems(): Promise<string[]> {
    const forksLength = this.itemIds.length;
    if (forksLength >= this.allItemsIds.length) {
      return [];
    }

    return lodash.slice(this.allItemsIds, forksLength, forksLength + 4);
  }

  static get styles() {
    return [...super.styles];
  }
}
