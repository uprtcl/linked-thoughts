import {
  html,
  css,
  internalProperty,
  LitElement,
  property,
  svg,
} from 'lit-element';
import lodash from 'lodash';
import { styles } from '@uprtcl/common-ui';
import { Entity, eveesConnect } from '@uprtcl/evees';
import { MenuConfig } from '@uprtcl/common-ui';
import { TextNode } from '@uprtcl/documents';
import { Router } from '@vaadin/router';
import FileAddIcon from '../../assets/icons/file-add.svg';
import DropDownIcon from '../../assets/icons/drop-down.svg';
import GlobeIcon from '../../assets/icons/globe.svg';
import { GenerateDocumentRoute } from '../../utils/routes.helpers';
import { Section } from '../types';

// const FileAddIcon = SVGToLit(require())

enum TitleFilter {
  null = '',
  asc = 'asc',
  des = 'des',
}
export class SectionPage extends eveesConnect(LitElement) {
  @property()
  uref: string;

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
  filterTitle: TitleFilter = TitleFilter.asc;

  sectionData: Entity<Section>;

  async firstUpdated() {
    this.loading = true;

    this.sectionData = await this.evees.getPerspectiveData(this.uref);

    await Promise.all(
      this.sectionData.object.pages.map(async (pageId) => {
        const page = await this.evees.getPerspectiveData(pageId);

        this.pageList.push(page);
      })
    );
    this.filteredPageList = this.pageList;
    this.title = this.sectionData.object.title;
    this.loading = false;
  }

  sortPagesBy() {
    switch (this.filterTitle) {
      case TitleFilter.asc:
        this.filteredPageList = lodash
          .sortBy(this.filteredPageList, (pageData) => pageData.object.text)
          .reverse();

        this.filterTitle = TitleFilter.des;
        break;

      case TitleFilter.des:
        this.filteredPageList = lodash.sortBy(
          this.filteredPageList,
          (pageData) => pageData.object.text
        );

        this.filterTitle = TitleFilter.asc;
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

  navigateToDoc(uref)
  {
    Router.go(GenerateDocumentRoute(uref))
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
        <div>${DropDownIcon}</div>
      </div>
    `;
  }
  renderPageItems() {
    return this.filteredPageList.length == 0
      ? html``
      : html`${this.filteredPageList.map((pageData) => {
          return html`
            <tr>
              <td @click=${()=>this.navigateToDoc(pageData.id)}>
                ${pageData.object.text
                  ? html`<b>${pageData.object.text}</b>`
                  : html`<i>Untitled</i>`}
              </td>
              <td>an hour ago (Not real)</td>
              <td>Blog</td>
              <td>_ _ _</td>
              <td>:</td>
            </tr>
          `;
        })}`;
  }
  renderPageListTable() {
    return html`
      <table style="width:100%">
        <thead class="table-head">
          <tr>
            <th @click=${this.sortPagesBy}>Title</th>
            <th>Last Viewed</th>
            <th>True Location</th>
            <th>References</th>
            <th>Action</th>
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
          margin: 0.5rem 2rem 0.5rem 0;
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
      `,
    ];
  }
}
