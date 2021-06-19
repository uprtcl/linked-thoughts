import lodash, { times } from 'lodash';
import { html, css, internalProperty, query, property } from 'lit-element';
import { Logger, SearchOptions } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import UprtclIsVisible from '../IntersectionObserver/IntersectionObserver';
import { icons, MenuOptions, UprtclTextField } from '@uprtcl/common-ui';
import { ItemConfig } from './Items/block.item.base';
import { tableStyles } from './table.styles';

export enum BlockViewType {
  tableRow = 'table-row',
  gridCard = 'grid-card',
  pageFeedItem = 'page-feed-item',
}

export enum HeaderViewType {
  section = 'section',
  feed = 'feed',
}

const LOGINFO = true;

export interface CollectionConfig {
  title?: string;
  itemsTitle?: string;
  blockView?: BlockViewType;
  headerView?: HeaderViewType;
  itemConfig?: ItemConfig;
}

export class CollectionBaseElement extends ConnectedElement {
  logger = new Logger('ForksPage');

  @property({ type: Object })
  config: CollectionConfig;

  @internalProperty()
  itemIds: string[] = [];

  @internalProperty()
  searchQuery: string = '';

  @internalProperty()
  blockView: BlockViewType;

  @internalProperty()
  itemHeight: string;

  appendItems: (items: string[]) => {};

  @query('#search-input')
  searchInput: UprtclTextField;

  @query('#is-visible')
  isVisibleEl!: UprtclIsVisible;

  protected actionOptions: MenuOptions = new Map();
  protected batchSize: number = 3;
  protected uiParentId: string; // valid only for data-based collections

  constructor() {
    super();
  }

  async firstUpdated() {
    this.config = this.config || {
      title: '',
      itemsTitle: '',
      blockView: this.config.blockView || BlockViewType.gridCard,
      headerView: this.config.headerView || HeaderViewType.section,
      itemConfig: this.config.itemConfig || {
        showDate: true,
        showActions: false,
      },
    };

    this.reset();
  }

  async reset() {
    this.itemIds = [];
    this.blockView = this.config.blockView;
    this.updateHeight();
    this.getMoreFeed();
  }

  private async getMoreFeed() {
    if (this.isVisibleEl) {
      if (LOGINFO) this.logger.log('disable()');
      this.isVisibleEl.enable = false;
      await this.isVisibleEl.updateComplete;
    }

    const newItems = await this.getMoreItems(
      this.itemIds.length,
      this.batchSize,
      {
        text: { value: this.searchQuery },
      }
    );

    if (newItems.length === 0) {
      return;
    }

    this.itemIds = this.itemIds.concat(newItems);

    setTimeout(async () => {
      if (this.isVisibleEl) {
        if (LOGINFO) this.logger.log('enable()');
        this.isVisibleEl.enable = true;

        await this.isVisibleEl.updateComplete;

        if (this.isVisibleEl.isShown) {
          if (LOGINFO) this.logger.log('is still visible!');
          await this.getMoreFeed();
        }
      }
    }, 0);
  }

  visibleChanged(value: boolean) {
    if (LOGINFO) this.logger.log('visibleChanged()', value);
    if (value) {
      this.getMoreFeed();
    }
  }

  getMoreItems(
    start: number,
    first: number,
    options: SearchOptions
  ): Promise<string[]> {
    throw new Error(
      'getMoreItems not implemented. This class is designed to be extended'
    );
  }

  debouncedSearchByText = lodash.debounce(this.searchByText, 1000);

  searchByText() {
    this.searchQuery = this.searchInput.value.trim()
      ? this.searchInput.value
      : undefined;

    this.reset();
  }

  renderListActionsHeader() {
    const sortMenuConfig: MenuOptions = new Map();
    sortMenuConfig.set('name', { text: 'Name' });
    sortMenuConfig.set('lastUpdated', { text: 'Last Modified' });
    sortMenuConfig.set('dateForked', { text: 'Date Forked' });

    return html`
      <div class="list-actions-cont">
        <div class="list-actions-heading">${this.config.itemsTitle}</div>
        <uprtcl-options-menu
          icon="orderby"
          @option-click=${() => {}}
          .config=${sortMenuConfig}
          skinny
          secondary
        >
        </uprtcl-options-menu>
        <uprtcl-icon-button
          class=${`view-button ${
            this.blockView === BlockViewType.tableRow ? 'selected' : ''
          }`}
          @click=${() => this.setView(BlockViewType.tableRow)}
          button
          skinny
          icon="list_view"
        ></uprtcl-icon-button>
        <uprtcl-icon-button
          class=${`view-button ${
            this.blockView === BlockViewType.gridCard ? 'selected' : ''
          }`}
          @click=${() => this.setView(BlockViewType.gridCard)}
          button
          skinny
          icon="grid_view"
        ></uprtcl-icon-button>
      </div>
      <div class="hr"></div>
    `;
  }

  setView(blockView: BlockViewType) {
    this.blockView = blockView;
    this.updateHeight();
  }

  updateHeight() {
    switch (this.blockView) {
      case BlockViewType.gridCard:
        this.itemHeight = '140px';
        break;

      case BlockViewType.tableRow:
        this.itemHeight = '45px';
        break;

      case BlockViewType.pageFeedItem:
        this.itemHeight = '300px';
        break;
    }
  }

  renderSectionHeader() {
    return html`
      <div class="header-cont">
        <span class="section-heading">${this.title}</span>
        ${this.renderSearchbox()}
      </div>
    `;
  }

  renderSearchbox() {
    const iconLeft = this.config.headerView === HeaderViewType.feed;
    const containerClasses = `search-cont ${
      this.config.headerView === HeaderViewType.section
        ? `search-cont-border search-cont-small`
        : ''
    }`;

    return html`<div class=${containerClasses}>
      ${iconLeft ? this.renderIcon() : ''}
      <uprtcl-textfield
        id="search-input"
        @input=${() => {
          this.debouncedSearchByText();
        }}
        label="Find pages..."
      ></uprtcl-textfield>
      ${!iconLeft ? this.renderIcon() : ''}
    </div>`;
  }

  renderIcon() {
    const iconClasses =
      this.config.headerView === HeaderViewType.section ? `icon-padded` : '';

    return html`<div class=${iconClasses} @click=${this.searchByText}>
      ${icons.search_lense}
    </div>`;
  }

  renderFeedHeader() {
    return this.renderSearchbox();
  }

  renderHeader() {
    switch (this.config.headerView) {
      case HeaderViewType.section:
        return html`${this.renderSectionHeader()}
        ${this.renderListActionsHeader()}`;

      case HeaderViewType.feed:
        return this.renderFeedHeader();
    }
  }

  renderItemsTable() {
    return html`
      <!-- WARNING 
          THIS MUST BE CONSISTEN WITH THE 
            table-row.item.ts component
            and table.styles.ts -->
      <div class="table">
        <div class="table-row header">
          <div class="table-cell title">Title</div>
          <div class="table-cell date">Date Created</div>
          <div class="table-cell location">Location</div>
          <div class="table-cell actions">Actions</div>
        </div>

        ${this.renderBlockItems()}
      </div>
    `;
  }

  renderItemsGrid() {
    return html`
      <div class="grid-view-container">${this.renderBlockItems()}</div>
    `;
  }

  renderBlockItems() {
    return this.itemIds.map((uref) => {
      return this.renderItem(uref, this.uiParentId);
    });
  }

  renderItem(uref: string, uiParentId: string) {
    switch (this.blockView) {
      case BlockViewType.gridCard:
        return html`<app-item-grid-card
          style=${`height: ${this.itemHeight}`}
          uref=${uref}
          ui-parent=${uiParentId}
          .config=${this.config.itemConfig}
          .actionOptions=${this.actionOptions}
        ></app-item-grid-card>`;

      case BlockViewType.tableRow:
        return html`<app-item-table-row
          class="table-row table-row-item"
          style=${`height: ${this.itemHeight}`}
          uref=${uref}
          ui-parent=${uiParentId}
          .config=${this.config.itemConfig}
          .actionOptions=${this.actionOptions}
        ></app-item-table-row>`;

      case BlockViewType.pageFeedItem:
        return html`<app-item-page-feed
          style=${`height: ${this.itemHeight}`}
          uref=${uref}
          ui-parent=${uiParentId}
          .config=${this.config.itemConfig}
          .actionOptions=${this.actionOptions}
        ></app-item-page-feed>`;
    }
  }

  render() {
    return html` ${this.renderHeader()}
      <div class="items-container">
        ${this.blockView === BlockViewType.gridCard
          ? this.renderItemsGrid()
          : this.renderItemsTable()}

        <app-intersection-observer
          id="is-visible"
          @visible-changed="${(e) => this.visibleChanged(e.detail.value)}"
        >
        </app-intersection-observer>
      </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      tableStyles,
      css`
        /* Header */
        .header-cont {
          display: flex;
          flex-direction: row;
        }
        .section-heading {
          flex: 1;
          font-size: 1.5rem;
          text-transform: uppercase;
          font-weight: 500;
        }
        .icon-padded {
          padding: 0 1rem;
        }
        .search-cont {
          display: flex;
          align-items: center;
        }
        .search-cont-border {
          border: 2px solid var(--gray-light);
          border-radius: 5px;
          border-width: 2px;
        }
        .search-cont-small {
          --font-size: 16px;
        }
        .search-field {
          border: none;
          outline: none;
          font-size: 1.1rem;
        }
        .list-actions-cont {
          display: flex;
          align-items: center;
          margin-top: 2rem;
        }
        .view-button {
          --svg-stroke: #7e8890;
        }
        .view-button.selected {
          --svg-stroke: var(--primary);
        }
        .hr {
          margin: 1.5rem 0rem 0.5rem 0rem;
          border-bottom: 0.6px solid #bdbdbd;
        }
        .list-actions-cont > * {
          margin: 0.5rem 2rem 0 0;
        }
        .list-actions-heading {
          flex: 1;
          font-weight: 500;
          font-size: 20px;
        }
        .items-container {
          padding: 1rem 0rem;
        }
        .grid-view-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
      `,
    ];
  }
}
