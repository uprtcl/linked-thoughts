import { Commit, Signed } from '@uprtcl/evees';
import { html, css, property } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import MinusIcon from '../../assets/icons/minus.svg';
import MoveToIcon from '../../assets/icons/move-to.svg';
import DuplicateIcon from '../../assets/icons/duplicate.svg';

import { TimestampToDate } from '../../utils/date';
const MAX_HEIGHT = 400;

export const PAGE_SELECTED_EVENT_NAME = 'page-selected';
export default class ReadOnlyPage extends ConnectedElement {
  @property({ type: Boolean })
  loading: boolean = true;

  firstUpdated() {
    this.load();
  }

  async load() {
    this.loading = true;

    this.loading = false;
  }

  render() {
    if (this.loading) {
      return html`<evees-loading></evees-loading>`;
    }

    return html`<div class="cont">
      <h3>The beginning of time started with all the best</h3>
      <p class="description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna, morbi ac
        congue a mattis. Risus nunc.....
      </p>
      <p class="author">Thomas Oppong</p>
      <div class="actions">
        <div>${MinusIcon} <span>Remove</span></div>
        <div>${MoveToIcon} <span>Remove</span></div>
        <div>${DuplicateIcon} <span>Remove</span></div>
      </div>
    </div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          font-family: 'Inter';
        }
        .cont {
          padding-top: 1rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #ccc;
          position: relative;
        }
        .description {
          color: #828282;
          font-size: 0.9rem;
        }
        .author {
          font-family: Poppins;
          font-style: normal;
          font-weight: 500;
          font-size: 13px;
          line-height: 19px;
          /* identical to box height */

          color: #de5163;
        }
        .actions {
          margin-top: 0.25rem;
          display: flex;
          color: #9797aa;
        }
        .actions > * {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 3%;
          font-size: 0.9rem;
        }
        .actions span {
          margin-left: 0.25rem;
        }
      `,
    ];
  }
}
