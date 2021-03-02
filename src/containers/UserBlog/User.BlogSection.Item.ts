import { UprtclTextField } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import { html, css, property, internalProperty, query } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LTRouter } from '../../router';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import { GenearateReadURL } from '../../utils/routes.generator';

const MAX_HEIGHT = 400;
export default class ReadOnlyPage extends ConnectedElement {
  @property({ type: String })
  uref: string;

  render() {
    return html`<div class="cont">
      <div class="body">
        <div class="doc-cont">
          <documents-editor
            id="doc-editor"
            uref=${this.uref}
            ?read-only=${true}
          >
          </documents-editor>
        </div>
        <div class="action-cont">
          <a href=${GenearateReadURL(this.uref)} target="_blank"
            ><div class="read-more">Read More</div></a
          >
        </div>
      </div>
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          font-family: 'Inter';
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

        .overlay {
          position: absolute;
          height: ${MAX_HEIGHT / 20}px;
          width: 100%;
          bottom: 0;
          background: linear-gradient(0deg, #fff 0%, #fff0);
          z-index: 2;
        }
        .action-cont {
          margin-left: 2.5rem;
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
