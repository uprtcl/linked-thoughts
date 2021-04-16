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
import { MenuOptions } from '@uprtcl/common-ui';

export enum BlockViewType {
  tableRow = 'table-row',
  gridCard = 'grid-card',
}

const LOGINFO = true;

export class CollectionBaseElement extends ConnectedElement {
  logger = new Logger('ForksPage');

  @property()
  title: string;

  @property({ type: String, attribute: 'view' })
  viewType: BlockViewType;

  @internalProperty()
  itemIds: string[] = [];

  @internalProperty()
  searchQuery: string = '';

  /** a set block views are supported by default */

  loading: boolean = true;

  @query('#is-visible')
  isVisibleEl!: UprtclIsVisible;

  protected actionOptions: MenuOptions = new Map();
  protected batchSize: number = 3;

  async firstUpdated() {
    this.viewType = this.viewType || BlockViewType.gridCard;
    this.reset();
  }

  async reset() {
    this.itemIds = [];
    this.getMoreFeed();
  }

  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.reset();
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
          @click=${() => (this.viewType = BlockViewType.tableRow)}
        >
          ${this.viewType === BlockViewType.tableRow
            ? html`${ListViewIconSelected}`
            : html`${ListViewIcon}`}
        </div>
        <div
          class="clickable"
          @click=${() => (this.viewType = BlockViewType.gridCard)}
        >
          ${this.viewType === BlockViewType.gridCard
            ? html`${GridViewIconSelected}`
            : html`${GridViewIcon}`}
        </div>
      </div>
    `;
  }

  renderHeader() {
    return html`
      <div class="header-cont">
        <span class="section-heading">${this.title}</span>
        <div class="search-cont">
          <input
            @input=${this.handleSearch}
            class="search-field"
            type="text"
            placeholder="Find 🍴..."
          /><span>${SearchIcon}</span>
        </div>
      </div>
    `;
  }

  renderItems() {
    if (this.viewType === BlockViewType.tableRow) {
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
          view=${this.viewType}
          uref=${uref}
          .actionOptions=${this.actionOptions}
        ></app-block-item>
      `;
    });
  }

  render() {
    if (this.loading) return html``;

    return html` <div class="static-header">
        ${this.renderHeader()} ${this.renderListActionsHeader()}
        <hr />
      </div>
      <div>
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
