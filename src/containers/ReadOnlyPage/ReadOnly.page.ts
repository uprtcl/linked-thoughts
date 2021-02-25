import { EveesBaseElement } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export default class ReadOnlyPage extends EveesBaseElement {
  @property()
  uref: string;

  async load() {
    await super.load();
    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
  }

  render() {
    if (this.loading) return null;

    return html`<div class="root">
      <div class="profileDetailsCont">
        <evees-author uref=${this.uref} show-name></evees-author>
      </div>
      <div class="docEditor">
        <documents-editor id="doc-editor" uref=${this.uref} ?read-only=${true}>
        </documents-editor>
      </div>
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          width: 100%;
          font-family: 'Inter';
        }
        .root {
          display: flex;
          flex: 1;
          height: 100%;
        }
        .profileDetailsCont {
          flex: 1;
          display: flex;
          margin-top: 3vh;
          justify-content: center;
        }
        .profile-img {
          height: calc(2rem + 3vmin);
          width: calc(2rem + 3vmin);
          border-radius: 50%;
          margin-right: 1rem;
          overflow: hidden;
        }
        .author-name {
          font-weight: bold;
          font-size: 16px;
          line-height: 19px;
          margin: 0.5rem 0;
        }
        .docEditor {
          flex: 4;
        }
      `,
    ];
  }
}
