import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export default class ReadOnlyPage extends ConnectedElement {
  @property()
  uref: string;

  @property({ type: Boolean, attribute: 'show-back' })
  showBack: boolean = false;

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
    this.userId = await (await this.evees.getEntity(this.uref)).object.payload
      .creatorId;
  }

  render() {
    if (this.loading) return html``;

    return html`<div
      class=${`rootCont ${
        this.containerType === 'mobile' ? 'rootContBlock' : 'rootContFlex'
      }`}
    >
      <div class="profileDetailsCont">
        ${this.showBack
          ? html`<div class="row">
              <uprtcl-button
                class="back-button"
                skinny
                icon="arrow_back"
                @click=${() => this.dispatchEvent(new CustomEvent('back'))}
                >Back</uprtcl-button
              >
            </div>`
          : ''}
        <div class="row">
          <evees-author
            class=${this.containerType === 'mobile'
              ? 'marginTopSmall'
              : 'marginTopLarge'}
            remote-id=${this.evees.findRemote('http').id}
            user-id=${this.userId}
            show-name
          ></evees-author>
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
        }
        .rootCont {
          height: 100%;
        }
        .row {
          width: 100%;
        }
        .rootContFlex {
          display: flex;
          padding: 16px 0px;
        }
        .rootContBlock {
          display: block;
          padding: 16px 0px;
        }
        .profileDetailsCont {
          min-width: 100px;
          padding: 0 0 0 4%;
          flex: 1;
        }
        .marginTopLarge {
          margin-top: 9vh;
        }
        .marginTopSmall {
          margin-top: 8px;
        }
        .docEditor {
          flex: 4;
        }
      `,
    ];
  }
}
