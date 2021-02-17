import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import ClosePurple from '../../assets/icons/close-purple.svg';
import ChevronLeft from '../../assets/icons/chevron-left.svg';
import ChevronRight from '../../assets/icons/chevron-right.svg';

export default class ExploreCard extends ConnectedElement {
  @property()
  exploreState: number = 0;
  firstUpdated() {}

  async load() {}

  renderExploreState() {
    switch (this.exploreState) {
      case 1:
        return html` <div class="explore-list">
          <div class="search-cont">${ClosePurple}</div>
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
          height: 90%;
          max-height: 90vh;
          overflow-y: scroll;
          width: 400px;
          animation: slideLeft 0.5s cubic-bezier(0.23, 1, 0.320, 1);
        }
        /* width */
        :host::-webkit-scrollbar {
          width: 5px;
        }

        /* Track */
        :host::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        /* Handle */
        :host::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }

        /* Handle on hover */
        :host::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .search-cont {
          border-bottom: 1px solid #e0e0e0;
          padding: 1rem;
          position: static;
          position: sticky;
          top: 0;
          background: #ffffffe6;
          backdrop-filter: blur(1rem);
        }

        @keyframes slideLeft {
          0% {
            transform: translateX(100%);
          }

          100% {
            transform: translateX(0%);
          }
        }
      `,
    ];
  }
}
