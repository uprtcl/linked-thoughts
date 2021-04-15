import lodash from 'lodash';
import { html, css, internalProperty, query } from 'lit-element';
import { Logger } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles, tableStyles } from '../../styles';
import SearchIcon from '../../assets/icons/search.svg';
import UprtclIsVisible from '../IntersectionObserver/IntersectionObserver';
import ListViewIcon from '../../assets/icons/list-view.svg';
import GridViewIcon from '../../assets/icons/grid-view.svg';
import ListViewIconSelected from '../../assets/icons/list-view-selected.svg';
import GridViewIconSelected from '../../assets/icons/grid-view-selected.svg';

export class ForksPage extends ConnectedElement {
  logger = new Logger('ForksPage');

  loading: boolean = true;

  @internalProperty()
  forks: string[] = [];

  @internalProperty()
  allForksIds: string[] = [];

  @internalProperty()
  searchQuery: string = '';

  @internalProperty()
  viewType: 'list' | 'grid' = 'grid';

  @query('#is-visible')
  isVisibleEl!: UprtclIsVisible;

  async firstUpdated() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const forksSection = await this.appManager.elements.get(
      '/linkedThoughts/forksSection'
    );
    const data = await this.evees.getPerspectiveData(forksSection.id);

    this.allForksIds = data.object.pages;
    this.getMoreFeed();
    this.loading = false;
  }
  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.searchFilter();
  }
  searchFilter() {
    // this.filteredPageList = lodash.filter(this.pageList, (pageData) => {
    //   return (
    //     lodash
    //       .lowerCase(pageData.data.object.text)
    //       .indexOf(lodash.lowerCase(this.searchQuery)) !== -1
    //   );
    // });
  }

  async getMoreFeed() {
    if (this.isVisibleEl) {
      this.logger.log('disable()');
      this.isVisibleEl.enable = false;
      await this.isVisibleEl.updateComplete;
    }

    const forksLength = this.forks.length;
    if (forksLength >= this.allForksIds.length) {
      return;
    }
    this.forks = [
      ...this.forks,
      ...lodash.slice(this.allForksIds, forksLength, forksLength + 4),
    ];

    setTimeout(async () => {
      if (this.isVisibleEl) {
        this.logger.log('enable()');
        this.isVisibleEl.enable = true;

        await this.isVisibleEl.updateComplete;

        if (this.isVisibleEl.isShown) {
          this.logger.log('is still visible!');
          await this.getMoreFeed();
        }
      }
    }, 0);
  }
  visibleChanged(value: boolean) {
    this.logger.log('visibleChanged()', value);
    if (value) {
      this.getMoreFeed();
    }
  }
  renderListActionsHeader() {
    const sortMenuConfig = {
      name: {
        text: 'Name',
      },
      lastUpdated: {
        text: 'Last Modified',
      },
      dateForked: {
        text: 'Date Forked',
      },
    };
    return html`
      <div class="list-actions-cont">
        <div class="list-actions-heading">Forked Items</div>
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
        <div class="clickable" @click=${() => (this.viewType = 'list')}>
          ${this.viewType === 'list'
            ? html`${ListViewIconSelected}`
            : html`${ListViewIcon}`}
        </div>
        <div class="clickable" @click=${() => (this.viewType = 'grid')}>
          ${this.viewType === 'grid'
            ? html`${GridViewIconSelected}`
            : html`${GridViewIcon}`}
        </div>
      </div>
    `;
  }
  renderHeader() {
    return html`
      <div class="header-cont">
        <span class="section-heading"> FORKS </span>
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
    if (this.viewType === 'list') {
      return html`
        <div class="table">
          <div class="theader">
            <div class="table_header">Title</div>
            <div class="table_header">Date Created</div>
            <div class="table_header">Author</div>
          </div>

          ${this.forks.map((e) => {
            return html`
              <app-forks-item viewType="list" uref=${e}></app-forks-item>
            `;
          })}
        </div>
      `;
    } else {
      return html`<div class="grid-view-container">
        ${Array.isArray(this.forks) && this.forks.length > 0
          ? this.forks.map((e) => {
              return html`<div class="grid-item">
                <app-forks-item viewType="grid" uref=${e}></app-forks-item>
              </div>`;
            })
          : null}
      </div>`;
    }
  }
  render() {
    if (this.loading) return html``;

    return html` <div class="static-header">
        ${this.renderHeader()} ${this.renderListActionsHeader()}
        <hr />
      </div>
      <div>
        ${Array.isArray(this.forks) && this.forks.length > 0
          ? this.renderItems()
          : null}
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
        :host {
          overflow-y: scroll;
          padding: 3vh 2%;
        }
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
        .grid-item {
          flex-basis: 40%;
          padding-bottom: 1rem;
          border-bottom: 1px solid #ccc9;
          margin: 0 1rem;
          flex-grow: 1;
        }
      `,
    ];
  }
}
