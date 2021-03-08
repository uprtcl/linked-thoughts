import { Commit, Signed } from '@uprtcl/evees';
import { html, css, property } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import { GenearateUserDocReadURL } from '../../utils/routes.generator';

import { TimestampToDate } from '../../utils/date';
const MAX_HEIGHT = 400;
export default class ReadOnlyPage extends ConnectedElement {
  @property()
  onSelection: Function;

  @property({ type: String })
  uref: string;

  @property({ type: String })
  userId: string;

  @property()
  head = null;

  @property({ type: Boolean })
  loading: boolean = true;
  firstUpdated() {
    this.load();
  }
  async load() {
    this.loading = true;
    const { details } = await this.evees.client.getPerspective(this.uref);

    let head = undefined;
    if (details.headId) {
      head = await this.evees.client.store.getEntity<Signed<Commit>>(
        details.headId
      );
    }

    this.head = head;
    this.loading = false;
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
        <div
          class="action-cont clickable"
          @click=${() => {
            this.onSelection(this.uref);
          }}
        >
          <a href=${GenearateUserDocReadURL(this.userId, this.uref)}>
            <div class="read-more">Read More</div>
          </a>
          <hr />
        </div>
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
          font-family: Inter;

          font-weight: 500;

          color: #da3e52;
        }
      `,
    ];
  }
}
