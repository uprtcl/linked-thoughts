import { html, css, internalProperty } from 'lit-element';
import lodash from 'lodash';
import moment from 'moment';
import { Router } from '@vaadin/router';

import { MenuConfig, styles } from '@uprtcl/common-ui';
import {
  Secured,
  Commit,
  EveesBaseElement,
  Perspective,
  Signed,
  PerspectiveDetails,
  Entity,
} from '@uprtcl/evees';
import { TextNode } from '@uprtcl/documents';

import { ErrorBase } from '../../utils/error.base';
import { GenerateDocumentRoute } from '../../utils/routes.helpers';
import { sharedStyles } from '../../styles';
import SearchIcon from '../../assets/icons/search.svg';
import { APP_MANAGER } from '../../services/init';
import { AppManager } from '../../services/app.manager';

import { Section } from '../types';

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

interface PageData {
  data: Entity<TextNode>;
  meta: {
    head: Secured<Commit>;
    perspective: Secured<Perspective>;
    details: PerspectiveDetails;
  };
}
export class SectionPage extends EveesBaseElement<Section> {
  @internalProperty()
  title: string | null = null;

  @internalProperty()
  pageList: Array<PageData> = [];

  @internalProperty()
  filteredPageList: Array<PageData> = [];

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

  @internalProperty()
  canCreate = false;

  appManager!: AppManager;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }

  async load() {
    await super.load();

    const privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.canCreate = privateSection.id === this.uref;

    this.pageList = await Promise.all(
      this.data.object.pages.map(async (pageId) => {
        const { details } = await this.localEvees.client.getPerspective(pageId);

        const perspective = await this.localEvees.client.store.getEntity<
          Signed<Perspective>
        >(pageId);

        let head = undefined;
        let data = undefined;

        if (details.headId) {
          head = await this.localEvees.client.store.getEntity<Signed<Commit>>(
            details.headId
          );

          data = await this.localEvees.client.store.getEntity<TextNode>(
            head.object.payload.dataId
          );
        }

        return {
          data,
          meta: {
            details,
            perspective,
            head,
          },
        };
      })
    );
    this.filteredPageList = this.pageList;
    this.title = this.data.object.title;
  }

  async newPage() {
    const pageId = await this.appManager.newPage(this.uref);
    Router.go(GenerateDocumentRoute(pageId));
  }

  sortPagesBy(sortType: SortType) {
    const funcFilterTitle = (pageData) => pageData.data.object.text;
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
          .lowerCase(pageData.data.object.text)
          .indexOf(lodash.lowerCase(this.searchQuery)) !== -1
      );
    });
  }

  sortBasedOn(e) {
    switch (e.detail.key) {
      case 'dataCreated':
        this.sortPagesBy(SortType.dateCreated);
        break;
      case 'lastUpdated':
        this.sortPagesBy(SortType.dataUpdated);
        break;
      case 'title':
        this.sortPagesBy(SortType.title);
        break;
    }
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
          /><span>${SearchIcon}</span>
        </div>
      </div>
    `;
  }
  renderListActionsHeader() {
    const sortMenuConfig: MenuConfig = {
      dateCreated: {
        text: 'Date Created',
      },
      lastUpdated: {
        text: 'Last Updated',
      },
      title: {
        text: 'Title',
      },
    };
    return html`
      <div class="list-actions-cont">
        <div class="list-actions-heading">${this.title} Pages</div>
        ${this.canCreate
          ? html`<uprtcl-button skinny @click=${() => this.newPage()}>
              New Page
            </uprtcl-button>`
          : ''}
        <div>
          <uprtcl-options-menu
            icon="orderby"
            @option-click=${this.sortBasedOn}
            .config=${sortMenuConfig}
            skinny
            secondary
          >
          </uprtcl-options-menu>
        </div>
      </div>
    `;
  }
  renderPageItems() {
    return this.filteredPageList.length == 0
      ? html``
      : html`${this.filteredPageList.map((pageData) => {
          try {
            let creationTime,
              lastUpdatedTime = null;

            if (pageData.meta.perspective && pageData.meta.head) {
              creationTime = moment(
                pageData.meta.perspective.object.payload.timestamp
              ).toLocaleString();

              lastUpdatedTime = moment(
                pageData.meta.head.object.payload.timestamp
              ).toLocaleString();
            }
            return html`
              <tr>
                <td
                  class="clickable"
                  @click=${() =>
                    this.navigateToDoc(pageData.meta.perspective.id)}
                >
                  ${pageData.data.object.text
                    ? html`<b>${pageData.data.object.text}</b>`
                    : html`<i>Untitled</i>`}
                </td>
                <td .title=${lastUpdatedTime}>
                  ${moment(lastUpdatedTime).fromNow()}
                </td>
                <td .title=${creationTime}>
                  ${moment(creationTime).fromNow()}
                </td>
              </tr>
            `;
          } catch (e) {
            ErrorBase.FailingPromise(e);
          }
        })}`;
  }
  renderPageListTable() {
    return html`
      <table style="width:100%">
        <thead >
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
      <div class="static-header">
        ${this.renderHeader()} ${this.renderListActionsHeader()}
        <hr />
      </div>
      <div class="page-body">${this.renderPageListTable()}</div>
    `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          overflow: scroll;
          padding: 3% 5%;
          height: 100%;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        :host::-webkit-scrollbar {
          display: none;
        }
        .static-header {
          width: 100%;
        }
        .page-body {
          padding: 0 1rem;
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
          border-width: 1.1px;
          display: flex;
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
          padding: 0 1rem;
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
          transition: all 0.1s ease-in;
        }
        tr:hover {
          background: #0001;
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
