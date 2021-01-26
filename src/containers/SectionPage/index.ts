import { html, css, internalProperty, LitElement, property } from 'lit-element';
import lodash from 'lodash';
import moment from 'moment';
import { styles } from '@uprtcl/common-ui';

import { Commit, Entity, eveesConnect, Perspective } from '@uprtcl/evees';
import { Router } from '@vaadin/router';
import FileAddIcon from '../../assets/icons/file-add.svg';
import DropDownIcon from '../../assets/icons/drop-down.svg';
import { GenerateDocumentRoute } from '../../utils/routes.helpers';
import { Section } from '../types';
import { Signed } from '@uprtcl/evees/dist/types/patterns/interfaces/signable';
import { sharedStyles } from '../../styles';
// const FileAddIcon = SVGToLit(require())

enum SortType {
  title,
  dateCreated,
  dataUpdated,
}

enum SortFilter {
  null = '',
  asc = 'asc',
  des = 'des',
}
export class SectionPage extends eveesConnect(LitElement) {
  @property()
  uref: string;

  @property()
  sectionIndex: number;

  @internalProperty()
  loading = true;

  @internalProperty()
  title: string | null = null;

  @internalProperty()
  pageList: Array<any> = [];

  @internalProperty()
  filteredPageList: Array<any> = [];

  @internalProperty()
  searchQuery: string = '';

  @internalProperty()
  filterTitle: SortFilter = SortFilter.asc;

  @internalProperty()
  filterDateCreated: SortFilter = SortFilter.asc;

  @internalProperty()
  filterDateUpdated: SortFilter = SortFilter.asc;

  @internalProperty()
  filterDropDown: boolean = false;

  sectionData: Entity<Section>;

  async firstUpdated() {
    this.loading = true;
    this.load();
    this.loading = false;
  }

  updated(changedProperties) {
    if (changedProperties.has('uref')) {
      this.load();
    }
  }

  async load() {
    this.sectionData = await this.evees.getPerspectiveData(this.uref);

    await Promise.all(
      this.sectionData.object.pages.map(async (pageId) => {
        const page = await this.evees.getPerspectiveData(pageId);

        const { details } = await this.evees.client.getPerspective(pageId);

        const perspective = await this.evees.client.store.getEntity<
          Signed<Perspective>
        >(pageId);

        const head = await this.evees.client.store.getEntity<Signed<Commit>>(
          details.headId
        );

        page['meta'] = {
          details,
          perspective,
          head,
        };
        this.pageList.push(page);
      })
    );
    this.filteredPageList = this.pageList;
    this.title = this.sectionData.object.title;
  }

  sortPagesBy(sortType: SortType) {
    const funcFilterTitle = (pageData) => pageData.object.text;
    const funcFilterDateCreated = (pageData) =>
      pageData.meta.perspective.object.payload.timestamp;
    const funcFilterDateUpdated = (pageData) =>
      pageData.meta.head.object.payload.timestamp;

    let comparator_function = null;
    let current_sort_type = null;
    switch (sortType) {
      case SortType.title:
        comparator_function = funcFilterTitle;
        current_sort_type = this.filterTitle;
        break;
      case SortType.dateCreated:
        comparator_function = funcFilterDateCreated;
        current_sort_type = this.filterDateCreated;
        break;
      case SortType.dataUpdated:
        comparator_function = funcFilterDateUpdated;
        current_sort_type = this.filterDateUpdated;
        break;
    }

    const updateSortFilter = (sortType: SortType, value: SortFilter) => {
      switch (sortType) {
        case SortType.title:
          this.filterTitle = value;
          break;
        case SortType.dateCreated:
          this.filterDateCreated = value;
          break;
        case SortType.dataUpdated:
          this.filterDateUpdated = value;
          break;
      }
    };

    switch (current_sort_type) {
      case SortFilter.asc:
        this.filteredPageList = lodash
          .sortBy(this.filteredPageList, comparator_function)
          .reverse();

        updateSortFilter(sortType, SortFilter.des);
        break;

      case SortFilter.des:
        this.filteredPageList = lodash.sortBy(
          this.filteredPageList,
          comparator_function
        );

        updateSortFilter(sortType, SortFilter.asc);
        break;
    }
  }

  searchFilter() {
    this.filteredPageList = lodash.filter(this.pageList, (pageData) => {
      return (
        lodash
          .lowerCase(pageData.object.text)
          .indexOf(lodash.lowerCase(this.searchQuery)) !== -1
      );
    });
  }

  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.searchFilter();
  }

  navigateToDoc(uref) {
    Router.go(GenerateDocumentRoute(uref));
  }
  /**
   * Header includes the title of the section and the searchbar
   */
  renderHeader() {
    return html`
      <div class="header-cont">
        <span class="section-heading"> ${this.title} </span>
        <div class="search-cont">
          <input
            @input=${this.handleSearch}
            class="search-field"
            type="text"
            placeholder="Find pages..."
          /><span>🔍</span>
        </div>
      </div>
    `;
  }
  renderListActionsHeader() {
    return html`
      <div class="list-actions-cont">
        <div class="list-actions-heading">${this.title} Pages</div>
        <div class="action-new-page">${FileAddIcon} New Page</div>
        <div>
          ${this.filterDropDown
            ? html`<div class="filter-drop-down">
                <div
                  class="filter-drop-down-item clickable"
                  @click=${() => this.sortPagesBy(SortType.dateCreated)}
                >
                  Date Created
                </div>
                <div
                  class="filter-drop-down-item clickable"
                  @click=${() => this.sortPagesBy(SortType.dataUpdated)}
                >
                  Last Updated
                </div>
                <div
                  class="filter-drop-down-item clickable"
                  @click=${() => this.sortPagesBy(SortType.title)}
                >
                  Title
                </div>
              </div>`
            : null}
          <span
            @click=${() => {
              this.filterDropDown = !this.filterDropDown;
            }}
            >${DropDownIcon}</span
          >
        </div>
      </div>
    `;
  }
  renderPageItems() {
    return this.filteredPageList.length == 0
      ? html``
      : html`${this.filteredPageList.map((pageData) => {
          const creationTime = moment(
            pageData.meta.perspective.object.payload.timestamp
          ).toLocaleString();

          const lastUpdatedTime = moment(
            pageData.meta.head.object.payload.timestamp
          ).toLocaleString();

          return html`
            <tr>
              <td
                class="clickable"
                @click=${() => this.navigateToDoc(pageData.id)}
              >
                ${pageData.object.text
                  ? html`<b>${pageData.object.text}</b>`
                  : html`<i>Untitled</i>`}
              </td>
              <td .title=${lastUpdatedTime}>
                ${moment(lastUpdatedTime).fromNow()}
              </td>
              <td .title=${creationTime}>${moment(creationTime).fromNow()}</td>
            </tr>
          `;
        })}`;
  }
  renderPageListTable() {
    return html`
      <table style="width:100%">
        <thead class="table-head">
          <tr>
            <th>Title</th>
            <th>Last Updated</th>
            <th>Date Created</th>
          </tr>
        </thead>
        <tbody>
          ${this.renderPageItems()}
        </tbody>
      </table>
    `;
  }
  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`
      ${this.renderHeader()}

      <div class="page-body">
        ${this.renderListActionsHeader()}
        <hr />
        ${this.renderPageListTable()}
      </div>
    `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          margin: 3% 5%;
        }
        .page-body {
          margin: 0 2rem;
        }
        .header-cont {
          display: flex;
          flex-direction: row;
        }
        .page-item-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0.1rem 0.25rem;
          padding-left: 2.2rem;
          transition: background 0.1s ease-in-out;
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
        }
        .search-field {
          border: none;
          outline: none;
          font-size: 1.1rem;
        }
        .action-new-page {
          display: flex;
          align-items: center;

          color: var(--primary, #2f80ed);
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

        table {
          text-align: left;
        }
        th {
          text-transform: uppercase;
          color: grey;
          line-height: 2rem;
          font-weight: 500;
          font-size: 0.9rem;
        }
        tbody > tr {
          line-height: 2rem;
          color: grey;
          font-size: 1.1rem;
        }
        .filter-drop-down {
          min-width: 120px;

          position: absolute;
          background-color: var(--white, #fff);
          right: 100px;
          margin-top: 2.5rem;

          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .filter-drop-down-item {
          padding: 10px;
          text-align: right;
        }
      `,
    ];
  }
}
