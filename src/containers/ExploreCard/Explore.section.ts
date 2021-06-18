import { html, css, internalProperty } from 'lit-element';

import {
  getHome,
  GetPerspectiveOptions,
  Logger,
  Perspective,
  SearchOptions,
  Secured,
} from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import ChevronLeft from '../../assets/icons/chevron-left.svg';
import ChevronRight from '../../assets/icons/chevron-right.svg';
import { AppEvents, ConceptId } from '../../services/app.manager';
import {
  BlockViewType,
  CollectionConfig,
  HeaderViewType,
} from '../Collections/collection.base';

type TabName = 'explore' | 'clipboard';

export default class ExploreSection extends ConnectedElement {
  logger = new Logger('ExploreSection');

  @internalProperty()
  selectedSection: TabName = 'explore';

  @internalProperty()
  exploreState: number = 1;

  @internalProperty()
  selectedDocId: string;

  @internalProperty()
  loading: boolean = true;

  @internalProperty()
  hovering = false;

  firstExpanded: boolean = false;
  clipboardSection: Secured<Perspective>;
  exploreOptions: SearchOptions;

  async firstUpdated() {
    this.clipboardSection = await this.appManager.elements.get(
      '/linkedThoughts/clipboardSection'
    );

    const blogConcept = await this.appManager.getConcept(ConceptId.BLOGPOST);

    this.exploreOptions = {
      linksTo: { elements: [blogConcept.hash] },
    };

    this.appManager.events.on(
      AppEvents.blogPostCreated,
      (elements: string[]) => {
        // TODO: this.appendItemsToExplore(elements)
      }
    );
  }

  async handleToggleSection(type: TabName) {
    this.selectedSection = type;
  }

  closeExplore() {
    this.exploreState = 0;
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
      <uprtcl-button
        @click=${() => this.handleToggleSection('explore')}
        ?skinny=${this.selectedSection !== 'explore'}
        >Explore</uprtcl-button
      >
      <uprtcl-button
        class="margin-left"
        @click=${() => this.handleToggleSection('clipboard')}
        ?skinny=${this.selectedSection !== 'clipboard'}
        >Clipboard</uprtcl-button
      >
      <div class="close-icon">
        <uprtcl-icon-button
          icon="close_purple"
          button
          skinny
          @click=${() => this.closeExplore()}
        ></uprtcl-icon-button>
      </div>
    </div>`;
  }

  renderExploreState() {
    let containerClass = '';
    let resultsContainerClass = '';

    switch (this.exploreState) {
      case 1:
        containerClass = 'explore explore-list';
        break;
      case 2:
        containerClass = 'explore explore-page';
        break;
    }

    const config: CollectionConfig = {
      headerView: HeaderViewType.feed,
      blockView: BlockViewType.gridCard,
      itemConfig: {
        showActions: false,
        showDate: true,
      },
    };

    return html` <div class=${containerClass}>
      ${this.renderHeader()}
      <div class="collection-container">
        ${this.selectedSection === 'explore'
          ? html`<app-explore-collection
              class=${resultsContainerClass}
              .exploreOptions=${this.exploreOptions}
              .config=${config}
            ></app-explore-collection>`
          : html`<app-evees-data-collection
              class=${resultsContainerClass}
              uref=${this.clipboardSection.hash}
              .config=${config}
            ></app-evees-data-collection>`}
      </div>
    </div>`;
  }

  renderReadPage() {
    return html`<div class="readCont">
      <app-read-only-page
        containerType=${this.exploreState === 1 ? 'mobile' : 'desktop'}
        uref=${this.selectedDocId}
        show-back
        @back=${() => (this.selectedDocId = undefined)}
      ></app-read-only-page>
    </div>`;
  }

  renderNail() {
    return html`<div class="explore-navigation-tooltip">
      <div
        @click=${() => this.handleExploreClick()}
        class=${'clickable explore-heading' +
        (this.hovering ? 'light-grey' : '')}
      >
        EXPLORE
      </div>
      <div class=${'explore-navigation' + (this.hovering ? 'light-grey' : '')}>
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
    </div>`;
  }

  render() {
    return html`${this.renderNail()}
    ${this.exploreState > 0 ? this.renderExploreState() : ''}`;
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
          padding: 1rem 1rem;
          display: flex;
          align-items: center;
          background-color: #fafafa;
          border-radius: 1rem 0rem 0rem 0rem;
        }
        .collection-container {
          padding: 0rem 1.5rem;
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
        .close-icon {
          right: 1rem;
          position: absolute;
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
        .explore {
          background: rgb(255, 255, 255);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);
          /* Note: backdrop-filter has minimal browser support */
          border-radius: 1rem 0rem 0rem 1rem;
          width: 400px;
          height: 95vh;
          animation: slideLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }

        .explore-list {
          width: 400px;
        }

        .explore-page {
          width: 90vw;
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

        .selectedDocId {
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
