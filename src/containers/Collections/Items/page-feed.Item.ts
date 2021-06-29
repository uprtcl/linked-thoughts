import { html, css, property, internalProperty } from 'lit-element';
import { Commit, Secured, Signed } from '@uprtcl/evees';

import { ConnectedElement } from '../../../services/connected.element';
import { sharedStyles } from '../../../styles';

import { TimestampToDate } from '../../../utils/date';

const MAX_HEIGHT = 400;

export const PAGE_SELECTED_EVENT_NAME = 'page-selected';

export class PageFeedItem extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @internalProperty()
  head: Secured<Commit>;

  @property({ type: Boolean })
  loading: boolean = true;

  firstUpdated() {
    this.load();
  }

  async load() {
    this.loading = true;
    const { details } = await this.evees.getPerspective(this.uref);

    if (details.headId) {
      this.head = await this.evees.getEntity<Signed<Commit>>(details.headId);
    }

    this.loading = false;
  }

  selectItem() {
    this.dispatchEvent(
      new CustomEvent(PAGE_SELECTED_EVENT_NAME, {
        bubbles: true,
        composed: true,
        detail: { uref: this.uref },
      })
    );
  }

  render() {
    if (this.loading) {
      return html`<evees-loading></evees-loading>`;
    }

    return html`<div class="cont">
      <div class="timestamp">
        ${TimestampToDate(this.head.object.payload.timestamp)}
      </div>
      <div class="doc-cont">
        <documents-editor id="doc-editor" uref=${this.uref} ?read-only=${true}>
        </documents-editor>
        <div class="overlay"></div>
      </div>
      <uprtcl-button skinny class="read-more" @click=${() => this.selectItem()}>
        Read More
      </uprtcl-button>
    </div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .cont {
          height: 100%;
          width: 100%;
          max-width: 900px;
        }
        .timestamp {
          height: 30px;
          color: var(--gray-light);
        }
        .doc-cont {
          height: calc(100% - 30px - 30px);
          overflow: hidden;
          position: relative;
        }
        .overlay {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0px;
          left: 0px;
          pointer-events: none;
          background-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 1),
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0)
          );
        }
        .read-more {
          font-weight: 500;
          --primary: #da3e52;
          --primary-hover: #00000000;
        }
      `,
    ];
  }
}
