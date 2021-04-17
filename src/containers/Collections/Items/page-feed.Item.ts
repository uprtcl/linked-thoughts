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
    const { details } = await this.evees.client.getPerspective(this.uref);

    if (details.headId) {
      this.head = await this.evees.client.store.getEntity<Signed<Commit>>(
        details.headId
      );
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
      <div class="body">
        <span class="timestamp"
          >${TimestampToDate(this.head.object.payload.timestamp)}</span
        >
        <div class="doc-cont">
          <documents-editor
            id="doc-editor"
            uref=${this.uref}
            ?read-only=${true}
          >
          </documents-editor>
        </div>
        <div class="action-cont clickable" @click=${() => this.selectItem()}>
          <div class="read-more">Read More</div>

          <hr />
        </div>
      </div>
    </div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        hr {
          opacity: 0.3;
          margin-top: 1rem;
          margin-bottom: 2rem;
        }
        .cont {
          display: flex;
          position: relative;
        }
        .doc-cont {
          max-height: ${MAX_HEIGHT}px;
          overflow: hidden;
        }
        .body {
          width: 100%;
          max-width: 900px;
        }
        .timestamp {
          margin-left: 1.5rem;
          font-family: 'Poppins';
          color: #0007;
        }
        .overlay {
          position: absolute;
          height: ${MAX_HEIGHT / 20}px;
          width: 100%;
          bottom: 0;
          background: linear-gradient(0deg, #fff 0%, #fff0);
          z-index: 2;
        }
        .action-cont {
          margin-left: 1.5rem;
          margin-top: 1rem;
        }
        .read-more {
          font-weight: 500;
          color: #da3e52;
        }
      `,
    ];
  }
}
