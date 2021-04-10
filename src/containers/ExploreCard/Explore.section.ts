import lodash from 'lodash';
import { html, css, internalProperty, query } from 'lit-element';

import { UprtclTextField } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import ChevronLeft from '../../assets/icons/chevron-left.svg';
import ChevronRight from '../../assets/icons/chevron-right.svg';
import SearchIcon from '../../assets/icons/search.svg';
import { AppEvents } from '../../services/app.manager';
import UprtclIsVisible from '../IntersectionObserver/IntersectionObserver';
export default class ExploreCard extends ConnectedElement {
  logger = new Logger('ExploreSection');

  @internalProperty()
  selectedSection: 'explore' | 'jotter' = 'explore';
  @internalProperty()
  exploreState: number = 1;

  @internalProperty()
  blogFeedIds: string[] = [];

  @internalProperty()
  selectedBlogId: string;

  @internalProperty()
  loading: boolean = true;

  @internalProperty()
  isEnded: boolean = false;

  @internalProperty()
  hovering = false;

  @query('#search-input')
  searchInput: UprtclTextField;

  @query('#is-visible')
  isVisibleEl!: UprtclIsVisible;

  searchText: string;
  firstExpanded: boolean = false;

  async firstUpdated() {
    this.appManager.events.on(
      AppEvents.blogPostCreated,
      (elements: string[]) => {
        this.blogFeedIds.unshift(...elements);
        this.blogFeedIds = [...this.blogFeedIds];
      }
    );

    this.load();
  }

  async refresh() {
    this.isVisibleEl.enable = false;
    this.blogFeedIds = [];

    this.load();
  }

  async load() {
    this.loading = true;
    this.isEnded = false;

    this.logger.log('load()');

    /** get first results */
    await this.getMoreFeed(10);
    this.loading = false;
  }

  async updated(cp) {
    if (cp.has('exploreState')) {
      if (this.exploreState > 0 && cp.get('exploreState') === 0) {
        /** the first time the items list reapears we need to manually enable the isVisible component */
        this.isVisibleEl.enable = true;
      }
      if (this.exploreState > 1 && cp.get('exploreState') === 1) {
        /** if the explore state is fully expand refrest the isVisible check */
        this.isVisibleEl.enable = false;
        await this.isVisibleEl.updateComplete;
        this.isVisibleEl.enable = true;
      }
    }
  }

  visibleChanged(value: boolean) {
    this.logger.log('visibleChanged()', value);
    if (value) {
      this.getMoreFeed();
    }
  }

  async getMoreFeed(first: number = 3) {
    if (this.isEnded) return;

    this.logger.log('getMoreFeed()- curren ids:', this.blogFeedIds);

    if (this.isVisibleEl) {
      this.isVisibleEl.enable = false;
      await this.isVisibleEl.updateComplete;
    }

    const result = await this.appManager.getBlogFeed(
      this.blogFeedIds.length,
      first,
      this.searchText
    );

    this.isEnded = result.ended;
    this.blogFeedIds = this.blogFeedIds.concat(result.perspectiveIds);

    this.logger.log('getMoreFeed()- new ids:', this.blogFeedIds);

    await this.updateComplete;

    if (this.isVisibleEl) {
      this.isVisibleEl.enable = true;

      await this.isVisibleEl.updateComplete;

      if (this.isVisibleEl.isShown && !this.isEnded) {
        this.logger.log('is still visible!');
        await this.getMoreFeed();
      }
    }
  }

  searchByText() {
    this.selectedBlogId = null;
    this.blogFeedIds = [];
    this.searchText = this.searchInput.value.trim()
      ? this.searchInput.value
      : undefined;
    this.load();
  }
  debouncedSearchByText = lodash.debounce(this.searchByText, 1000);

  closeExplore() {
    this.exploreState = 0;
    this.selectedBlogId = null;
  }

  handleNavigation(type: 'increment' | 'decrement') {
    const currentState = this.exploreState;

    if (type === 'increment') {
      if (currentState < 2) {
        this.exploreState++;
      }
    } else {
      if (currentState > 0) {
        this.exploreState--;
      }
    }
  }

  handleExploreClick() {
    if (this.exploreState == 2) {
      this.handleNavigation('decrement');
    } else {
      this.handleNavigation('increment');
    }
  }

  renderHeader() {
    return html` <div class="header-tabs">
        <span
          @click=${() => (this.selectedSection = 'explore')}
          class=${`header-tab-item clickable ${
            this.selectedSection == 'explore' ? 'selected-section' : ''
          }`}
          >Explore</span
        >
        <span
          @click=${() => (this.selectedSection = 'jotter')}
          class=${`header-tab-item clickable ${
            this.selectedSection === 'jotter' ? 'selected-section' : ''
          }`}
          >Jotter</span
        >
      </div>
      <div class="header">
        <div class="search-cont">
          <div @click=${this.searchByText}>${SearchIcon}</div>
          <uprtcl-textfield
            id="search-input"
            @input=${() => {
              this.debouncedSearchByText();
            }}
            label="Search Intercreativity"
          ></uprtcl-textfield>
        </div>
        <uprtcl-icon-button
          icon="refresh"
          button
          skinny
          style="margin-right: 6px"
          @click=${() => this.refresh()}
        ></uprtcl-icon-button>
        <uprtcl-icon-button
          icon="clear"
          button
          skinny
          @click=${() => this.closeExplore()}
        ></uprtcl-icon-button>
      </div>`;
  }

  renderItems() {
    if (this.selectedBlogId) {
      return html`${this.renderReadPage()}`;
    }

    return html`
      ${this.loading
        ? html`<uprtcl-loading></uprtcl-loading>`
        : this.blogFeedIds.map((docId) => {
            return html`
              <app-explore-list-item
                @click=${() => {
                  this.selectedBlogId = docId;
                }}
                uref=${docId}
              ></app-explore-list-item>
            `;
          })}

      <app-intersection-observer
        id="is-visible"
        @visible-changed="${(e) => this.visibleChanged(e.detail.value)}"
      >
      </app-intersection-observer>
    `;
  }

  renderExploreState() {
    switch (this.exploreState) {
      case 1:
        return html` <div class="explore-list">
          ${this.renderHeader()}
          <div class="explore-list-cont">${this.renderItems()}</div>
        </div>`;
      case 2:
        return html`<div class="explore-page">
          ${this.renderHeader()}
          <div class="explore-page-cont">${this.renderItems()}</div>
        </div>`;
    }
  }

  renderReadPage() {
    return html`<div class="readCont">
      <app-read-only-page
        containerType=${this.exploreState === 1 ? 'mobile' : 'desktop'}
        uref=${this.selectedBlogId}
        show-back
        @back=${() => (this.selectedBlogId = undefined)}
      />
    </div>`;
  }
  render() {
    return html`<div class="explore-navigation-tooltip">
        <div
          @click=${() => this.handleExploreClick()}
          class=${'clickable explore-heading' +
          (this.hovering ? 'light-grey' : '')}
        >
          EXPLORE
        </div>
        <div
          class=${'explore-navigation' + (this.hovering ? 'light-grey' : '')}
        >
          <span
            @mouseEnter=${() => (this.hovering = true)}
            @mouseLeave=${() => (this.hovering = false)}
            ?disabled=${this.exploreState == 2}
            @click=${() => this.handleNavigation('increment')}
            class="navigation-button clickable"
            >${ChevronLeft}</span
          >
          <span
            ?disabled=${this.exploreState == 0}
            @click=${() => this.handleNavigation('decrement')}
            class="navigation-button clickable"
            >${ChevronRight}</span
          >
        </div>
      </div>

      ${this.renderExploreState()}`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: flex;
          align-items: center;
          z-index: 5;
        }
        .header-tabs {
          margin-top: 1rem;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
        }
        .header-tab-item {
          color: var(--gray-text);
          font-size: 1.2rem;
          padding: 0.5rem 1rem;
          border-radius: 5px;
        }
        .selected-section {
          background: var(--primary);

          color: var(--white);
          box-shadow: 0px 10px 55px -10px var(--primary);
        }

        .readCont {
          flex: 1;
          width: 100%;
        }
        .refresh {
          width: 25px;
          height: 25px;
          padding: 5px;
        }

        /* ToolTip */
        .explore-navigation-tooltip {
          background: rgb(255, 255, 255);
          box-shadow: 4px 0px 50px rgba(0, 0, 0, 0.1);
          position: relative;
          display: flex;
          align-items: center;
          height: fit-content;
          padding-right: 1rem;
        }
        .light-grey {
          background: rgba(240, 240, 240, 0.95);
        }
        .explore-navigation {
          position: absolute;
          left: -40%;
          background: #fff;
          padding: 0.6rem 0.3rem;
          border-radius: 50px;
          box-shadow: 0px 1px 20px rgba(0, 0, 0, 0.15);
        }
        .explore-heading {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          padding: 2.3rem 1.9rem 2.3rem 0.3rem;
          color: #828282;
          font-weight: 400;
          letter-spacing: 4px;
        }
        .navigation-button {
          padding: 0.2rem;
          border-radius: 50%;
          padding: 0.075rem 0.25rem;
        }

        .navigation-button:disabled,
        .navigation-button[disabled] {
          opacity: 0.3;
        }
        /* Explore List */
        .explore-list {
          background: rgb(255, 255, 255);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);

          /* Note: backdrop-filter has minimal browser support */
          border-radius: 20px 6px 6px 20px;

          width: 400px;
          animation: slideLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }
        .explore-list-cont {
          overflow-y: scroll;
          height: 85%;
          max-height: 85vh;
          min-height: 85vh;
        }
        /* width */
        *::-webkit-scrollbar {
          width: 8px;
        }

        /* Track */
        *::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        /* Handle */
        *::-webkit-scrollbar-thumb {
          background: #ccc;
        }

        /* Handle on hover */
        *::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #e0e0e0;
          position: static;
          position: sticky;
          top: 0;
          background: transparent;
          padding: 1rem 3%;
          z-index: 10;
        }

        .search-cont {
          flex: 1;
          align-items: center;
          display: flex;
          margin: 0 1rem;
          position: relative;
          background: transparent;
        }

        /* Explore Page */

        .explore-page {
          background: rgb(255, 255, 255);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);

          /* Note: backdrop-filter has minimal browser support */

          border-radius: 10px 3px 3px 10px;

          margin-right: 3vw;
          animation: slideLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          width: 90vw;
        }

        .explore-page-cont {
          overflow-y: auto;
          height: 80vh;
        }

        .explore-page-cont > * {
          display: block;
          float: left;
        }

        app-explore-list-item {
          height: 160px;
        }

        @keyframes slideLeft {
          0% {
            transform: translateX(100%);
          }

          100% {
            transform: translateX(0%);
          }
        }

        @media only screen and (max-width: 1284px) {
          .explore-page-cont > app-explore-list-item {
            width: 33.3333%;
          }
          .explore-page {
            width: 80vw;
          }
        }
        @media only screen and (max-width: 900px) {
          .explore-page-cont > app-explore-list-item {
            width: 50%;
          }
          .explore-page {
            width: 80vw;
          }
        }
        @media only screen and (max-width: 680px) {
          .explore-page-cont > app-explore-list-item {
            width: 100%;
          }
          .explore-page {
            width: 80vw;
          }
        }
        @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
          .explore-page {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(1rem);
          }
          .explore-navigation-tooltip {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(50px);
          }
          .explore-list {
            background: rgba(255, 255, 255, 0.6);
            box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(50px);
          }
        }
      `,
    ];
  }
}
