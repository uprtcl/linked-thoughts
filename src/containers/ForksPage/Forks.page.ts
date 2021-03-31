import { EveesBaseElement } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import SearchIcon from '../../assets/icons/search.svg';

export class ForksPage extends ConnectedElement {
  loading: boolean = true;

  @internalProperty()
  forks: string[] = null;

  @internalProperty()
  searchQuery: string = '';

  async firstUpdated() {
    await this.load();
  }

  async load() {
    const forksSection = await this.appManager.elements.get(
      '/linkedThoughts/forksSection'
    );
    const data = await this.evees.getPerspectiveData(forksSection.id);

    this.forks = data.object.pages;

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

  render() {
    if (this.loading) return html``;

    return html` <div class="static-header">
        ${this.renderHeader()} ${this.renderListActionsHeader()}
        <hr />
      </div>
      <div>
        <div class="grid-view-container">
          ${Array.isArray(this.forks) && this.forks.length > 0
            ? this.forks.map((e) => {
                return html`<div class="grid-item">
                  <app-forks-item uref=${e}></app-forks-item>
                </div>`;
              })
            : null}
        </div>
      </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
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
          border-bottom: 1px solid #ccc9;
          margin: 0 1rem;
          flex-grow: 1;
        }
      `,
    ];
  }
}
