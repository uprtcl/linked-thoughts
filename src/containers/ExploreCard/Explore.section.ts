import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import ChevronLeft from '../../assets/icons/chevron-left.svg';
import ChevronRight from '../../assets/icons/chevron-right.svg';
import SearchIcon from '../../assets/icons/search.svg';

export default class ExploreCard extends ConnectedElement {
  @internalProperty()
  exploreState: number = 0;

  @internalProperty()
  blogFeedIds: string[] = [];

  @property()
  selectedBlogId: string;

  loading: boolean = true;

  @property({ type: Boolean })
  isEnded: boolean = false;

  async firstUpdated() {
    await this.load();
  }

  async getMoreFeed() {
    if (this.isEnded) return;

    try {
      const result = await this.appManager.getPaginatedFeed({
        pagination: { first: 3, offset: this.blogFeedIds.length },
      });
      this.isEnded = result.ended;
      this.blogFeedIds = [...this.blogFeedIds, ...result.perspectiveIds];
    } catch (e) {
      console.error(e);
    }
  }
  async load() {
    this.loading = true;
    this.isEnded = false;
    const result = await this.appManager.getBlogFeed();
    this.blogFeedIds = result.perspectiveIds;
    this.loading = false;
  }

  async refresh() {
    this.load();
  }

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
      // Hide the blog page for mini-explore View
      // if (currentState == 2) {
      //   this.selectedBlogId = null;
      // }
      if (currentState > 0) {
        this.exploreState--;
      }
    }
  }
  renderHeader() {
    return html`<div class="header">
      <div class="search-cont">
        ${SearchIcon}<uprtcl-textfield
          label="(soon) Search Intercreativity"
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
    } else if (this.blogFeedIds.length > 0)
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
          @intersect="${this.getMoreFeed}"
          .thresholds="${[0.0]}"
          .root-margin="${'30px'}"
        ></app-intersection-observer>
      `;
    else {
      return html`No content found`;
    }
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
          @click=${() => this.handleNavigation('increment')}
          class="clickable explore-heading"
        >
          EXPLORE
        </div>
        <div class="explore-navigation">
          <span
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
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 4px 0px 50px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(50px);
          position: relative;
          display: flex;
          align-items: center;
          height: fit-content;
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
          background: rgba(255, 255, 255, 0.6);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(50px);
          /* Note: backdrop-filter has minimal browser support */
          font-family: 'Inter', sans-serif;

          border-radius: 20px 6px 6px 20px;

          width: 400px;
          animation: slideLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }
        .explore-list-cont {
          overflow-y: scroll;
          height: 500px;
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
          backdrop-filter: blur(1rem);
          padding: 1rem 3%;
          z-index: 10;
        }

        .search-cont {
          flex: 1;
          align-items: center;
          display: flex;
          margin-right: 1rem;
          position: relative;
        }

        /* Explore Page */

        .explore-page {
          background: rgba(255, 255, 255, 0.7);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(1rem);
          /* Note: backdrop-filter has minimal browser support */

          border-radius: 10px 3px 3px 10px;

          margin-right: 3vw;
          animation: slideLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          width: 90vw;
        }

        .explore-page-cont {
          display: block;
          overflow-y: auto;
          height: 80vh;
        }
        .explore-page-cont > app-explore-list-item {
          display: block;
          width: 25%;
          float: left;
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
      `,
    ];
  }
}
