import { EveesBaseElement } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export default class ReadOnlyPage extends ConnectedElement {
  @property()
  uref: string;

  @property()
  containerType: 'mobile' | 'desktop' = 'desktop';

  @internalProperty()
  userId: string;

  loading: boolean = false;

  async firstUpdated() {
    await this.load();
  }

  async load() {
    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
    this.userId = await (await this.evees.client.store.getEntity(this.uref))
      .object.payload.creatorId;
  }

  render() {
    if (this.loading) return html``;

    return html`<div
      class=${`rootCont ${
        this.containerType === 'mobile' ? 'rootContBlock' : 'rootContFlex'
      }`}
    >
      <div class="profileDetailsCont">
        <evees-author
          remote-id=${this.evees.findRemote('http').id}
          user-id=${this.userId}
          show-name
        ></evees-author>
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
        .rootCont {
          height: 100%;
        }

        .rootContFlex {
          display: flex;
          flex: 1;
        }
        .rootContBlock {
          display: block;
        }
        .profileDetailsCont {
          flex: 1;
          display: flex;
          margin-top: 3vh;
          justify-content: center;
          width: 50%;
          min-width: 100px;
          overflow: hidden;
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
