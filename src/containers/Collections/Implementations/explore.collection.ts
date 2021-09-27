import { internalProperty, property } from 'lit-element';
import { GetPerspectiveOptions, Logger, SearchOptions } from '@uprtcl/evees';

import { CollectionBaseElement } from '../collection.base';

/** a collection whose items are obtined from the searchEngine.explore endpoint */
export class ExploreCollection extends CollectionBaseElement {
  logger = new Logger('ExploreCollection');

  @internalProperty()
  exploreOptions: SearchOptions;

  @internalProperty()
  fetchOptions: GetPerspectiveOptions;

  async getMoreItems(): Promise<string[]> {
    const result = await this.evees.explore(
      {
        ...this.exploreOptions,
        pagination: {
          offset: this.itemIds.length,
          first: 10,
        },
        text: this.searchQuery
          ? {
              value: this.searchQuery,
              textLevels: -1,
            }
          : undefined,
      },
      {
        details: true,
        entities: true,
        levels: 0,
      }
    );

    return result.perspectiveIds;
  }

  static get styles() {
    return [...super.styles];
  }
}
