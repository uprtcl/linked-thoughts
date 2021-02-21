import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import ClosePurple from '../../assets/icons/close-purple.svg';
import ChevronLeft from '../../assets/icons/chevron-left.svg';
import ChevronRight from '../../assets/icons/chevron-right.svg';
import SearchIcon from '../../assets/icons/search.svg';
export default class ExploreCard extends ConnectedElement {
  @property()
  exploreState: number = 2;
  firstUpdated() {}

  async load() {}

  closeExplore() {
    this.exploreState = 0;
  }
  renderHeader() {
    return html`<div class="header">
      <div class="search-cont">
        ${SearchIcon}<input
          autofocus
          placeholder="Search something awesome..."
        />
      </div>
      <span class="clickable" @click=${this.closeExplore}>${ClosePurple}</span>
    </div>`;
  }
  renderExploreState() {
    switch (this.exploreState) {
      case 1:
        return html` <div class="explore-list">
          ${this.renderHeader()}
          <div class="explore-list-cont">
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
          </div>
        </div>`;
      case 2:
        return html`<div class="explore-page">
          ${this.renderHeader()}
          <div class="explore-page-cont">
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
            <app-explore-list-item></app-explore-list-item>
          </div>
        </div>`;
    }
  }
  render() {
    return html`<div class="explore-navigation-tooltip">
        <span class="explore-heading">EXPLORE</span>
        <div class="explore-navigation">
          <span @click=${() => this.exploreState++} class="navigation-button"
            >${ChevronLeft}</span
          >
          <span @click=${() => this.exploreState--} class="navigation-button"
            >${ChevronRight}</span
          >
        </div>
      </div>
      ${this.renderExploreState()} `;
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
        /* ToolTip */
        .explore-navigation-tooltip {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 4px 0px 50px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(50px);
          padding: 1rem 0.2rem 1rem 1.3rem;
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
          color: #828282;
          font-weight: 400;
          letter-spacing: 4px;
        }
        .navigation-button {
          padding: 0.2rem;
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
          justify-content: center;
          display: flex;
          margin-right: 1rem;
          position: relative;
        }
        .search-cont > input {
          border: none;
          font-size: 1.2rem;
          margin-left: 0.5rem;
          flex: 1;
          width: '100%';
          outline: none;
          background: transparent;
        }
        /* Explore Page */

        .explore-page {
          background: rgba(255, 255, 255, 0.3);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(50px);
          /* Note: backdrop-filter has minimal browser support */

          border-radius: 10px 3px 3px 10px;

          margin-right: 3vw;
          animation: slideLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          width: 90vw;
        }

        .explore-page-cont {
          display: flex;
          flex-wrap: wrap;
          padding: 2% 0%;
          overflow-y: scroll;
          height: 80vh;
        }
        .explore-page-cont > * {
          
          flex: 0 0 33.333333%;
        }
        app-explore-list-item:hover {
          background: #00000008;
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
          .explore-page-cont > * {
            flex: 0 0 25%;
          }
          .explore-page {
            width: 80vw;
          }
          .explore-navigation-tooltip {
            transform: scale(0.6);
          }
        }
        @media only screen and (max-width: 900px) {
          .explore-page-cont > * {
            flex: 0 0 33.33333%;
          }
          .explore-page {
            width: 80vw;
          }
          .explore-navigation-tooltip {
            transform: scale(0.6);
          }
        }
        @media only screen and (max-width: 680px) {
          .explore-page-cont > * {
            flex: 0 0 50%;
          }
          .explore-page {
            width: 80vw;
          }
          .explore-navigation-tooltip {
            transform: scale(0.6);
          }
        }
      `,
    ];
  }
}
