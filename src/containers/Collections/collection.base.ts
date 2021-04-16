import lodash from 'lodash';
import { html, css, internalProperty, query, property } from 'lit-element';
import { Logger, SearchOptions } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles, tableStyles } from '../../styles';
import SearchIcon from '../../assets/icons/search.svg';
import UprtclIsVisible from '../IntersectionObserver/IntersectionObserver';
import ListViewIcon from '../../assets/icons/list-view.svg';
import GridViewIcon from '../../assets/icons/grid-view.svg';
import ListViewIconSelected from '../../assets/icons/list-view-selected.svg';
import GridViewIconSelected from '../../assets/icons/grid-view-selected.svg';
import { MenuOptions, UprtclTextField } from '@uprtcl/common-ui';

export enum BlockViewType {
  tableRow = 'table-row',
  gridCard = 'grid-card',
}

export enum HeaderViewType {
  section = 'section',
  feed = 'feed',
}

const LOGINFO = true;

export class CollectionBaseElement extends ConnectedElement {
  logger = new Logger('ForksPage');

  @property()
  title: string;

  @property({ type: String, attribute: 'block-view' })
  blockViewType: BlockViewType;

  @property({ type: String, attribute: 'header-view' })
  headerViewType: HeaderViewType;

  @internalProperty()
  itemIds: string[] = [];

  @internalProperty()
  searchQuery: string = '';

  loading: boolean = true;
  appendItems: (items: string[]) => {};

  @query('#search-input')
  searchInput: UprtclTextField;

  @query('#is-visible')
  isVisibleEl!: UprtclIsVisible;

  protected actionOptions: MenuOptions = new Map();
  protected batchSize: number = 3;

  async firstUpdated() {
    this.blockViewType = this.blockViewType || BlockViewType.gridCard;
    this.headerViewType = this.headerViewType || HeaderViewType.section;
    this.reset();
  }

  async reset() {
    this.itemIds = [];
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
        <div class="list-actions-heading">Items</div>
        <div>
          <uprtcl-options-menu
            icon="orderby"
            @option-click=${() => {}}
            .config=${sortMenuConfig}
            skinny
            secondary
          >
          </uprtcl-options-menu>
        </div>
        <div
          class="clickable"
          @click=${() => (this.blockViewType = BlockViewType.tableRow)}
        >
          ${this.blockViewType === BlockViewType.tableRow
            ? html`${ListViewIconSelected}`
            : html`${ListViewIcon}`}
        </div>
        <div
          class="clickable"
          @click=${() => (this.blockViewType = BlockViewType.gridCard)}
        >
          ${this.blockViewType === BlockViewType.gridCard
            ? html`${GridViewIconSelected}`
            : html`${GridViewIcon}`}
        </div>
      </div>
    `;
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
    return html`<div class="search-cont">
      <div @click=${this.searchByText}>${SearchIcon}</div>
      <uprtcl-textfield
        id="search-input"
        @input=${() => {
          this.debouncedSearchByText();
        }}
        label="Search Intercreativity"
      ></uprtcl-textfield>
    </div>`;
  }

  renderFeedHeader() {
    return this.renderSearchbox();
  }

  renderHeader() {
    switch (this.headerViewType) {
      case HeaderViewType.section:
        return html`${this.renderSectionHeader()}
        ${this.renderListActionsHeader()}`;

      case HeaderViewType.feed:
        return this.renderFeedHeader();
    }
  }

  renderItems() {
    if (this.blockViewType === BlockViewType.tableRow) {
      return html`
        <div class="table">
          <div class="theader">
            <div class="table_header">Title</div>
            <div class="table_header">Date Created</div>
            <div class="table_header">Author</div>
          </div>

          ${this.renderBlockItems()}
        </div>
      `;
    } else {
      return html`<div class="grid-view-container">
        ${this.renderBlockItems()}
      </div>`;
    }
  }

  renderBlockItems() {
    return this.itemIds.map((uref) => {
      return html`
        <app-block-item
          class="block-item"
          view=${this.blockViewType}
          uref=${uref}
          .actionOptions=${this.actionOptions}
        ></app-block-item>
      `;
    });
  }

  render() {
    if (this.loading) return html``;

    return html` ${this.renderHeader()}
      <div class="items-container">
        ${this.renderItems()}

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
          font-weight: bold;
          text-transform: uppercase;
        }
        .search-cont {
          padding: 0.5rem 1.2rem;
          border: 2px solid grey;
          border-radius: 5px;
          border-width: 1.1px;
          display: flex;
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
        .list-actions-cont > * {
          margin: 0.5rem 2rem 0 0;
        }
        .list-actions-heading {
          flex: 1;
          font-weight: bold;
          font-size: 1.2rem;
          color: grey;
        }
        .grid-view-container {
          display: flex;
          flex-wrap: wrap;
        }
      `,
    ];
  }
}
