import { html, css, property, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { getRandomAvatar } from '@fractalsoftware/random-avatar-generator';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export default class ReadOnlyPage extends ConnectedElement {
  @property()
  uref: string;
  async firstUpdated() {
    await this.load();
  }

  @internalProperty()
  meta;

  @internalProperty()
  loading: boolean = true;

  async load() {
    this.loading = true;
    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
    this.meta = await (await this.evees.client.store.getEntity(this.uref))
      .object.payload;
    // debugger;
    this.loading = false;
  }

  render() {
    if (this.loading) return null;

    return html`<div class="root">
      <div class="profileDetailsCont">
        <div>
          <div class="profile-img">
            ${html`${unsafeHTML(getRandomAvatar())}`}
          </div>
          <div class="author-name">${this.meta.creatorId.slice(0,20)}</div>
        </div>
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
          flex: 3;
        }
      `,
    ];
  }
}
