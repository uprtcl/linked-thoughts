import { html, css, internalProperty, property, query } from 'lit-element';
import { styles } from '@uprtcl/common-ui';
import {
  Secured,
  Perspective,
  Evees,
  RecursiveContextMergeStrategy,
} from '@uprtcl/evees';
import { DocumentEditor } from '@uprtcl/documents';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

import RestrictedIcon from '../../assets/icons/left.svg';
import CloseIcon from '../../assets/icons/x.svg';
import MoreHorizontalIcon from '../../assets/icons/more-horizontal.svg';

export class DocumentPage extends ConnectedElement {
  @property({ type: String, attribute: 'page-id' })
  pageId: string;

  @internalProperty()
  hasPull = false;

  @internalProperty()
  loading = true;

  @internalProperty()
  readOnly = false;

  @query('#doc-editor')
  documentEditor: DocumentEditor;

  @property()
  showSnackBar = false;

  eveesPull: Evees;
  privateSectionPerspective: Secured<Perspective>;
  originId: string;

  async firstUpdated() {
    this.privateSectionPerspective = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.load();
  }

  updated(changedProperties) {
    if (
      changedProperties.has('pageId') &&
      changedProperties.get('pageId') !== undefined
    ) {
      this.load();
    }
  }

  async load() {
    window.onbeforeunload = function () {
      // return 'Are you sure?';
    };
    this.hasPull = false;

    const { details } = await this.evees.client.getPerspective(this.pageId);
    this.readOnly = details.guardianId !== this.privateSectionPerspective.id;

    const perspective = await this.evees.client.store.getEntity(this.pageId);

    if (
      perspective.object.payload.meta &&
      perspective.object.payload.meta.forking
    ) {
      // this page is a fork of another
      this.originId = perspective.object.payload.meta.forking.perspectiveId;
      this.checkOrigin();
    }

    this.loading = false;
  }

  async checkOrigin() {
    this.eveesPull = await this.appManager.compareForks(
      this.pageId,
      this.originId
    );
    this.hasPull = await this.appManager.workspaceHasChanges(this.eveesPull);
    // To show the snackbar
    if (this.hasPull) {
      this.showSnackBar = true;
    }
  }

  async pull() {
    await this.eveesPull.client.flush();
    this.checkOrigin();
    this.documentEditor.reload();
  }

  renderTopNav() {
    return html`<div class="app-action-bar">
      <uprtcl-popper>
        <uprtcl-button slot="icon" skinny secondary>Share</uprtcl-button>
        <share-card
          uref=${this.pageId}
          from=${this.privateSectionPerspective.id}
        ></share-card>
      </uprtcl-popper>
    </div>`;
  }

  renderSnackBar(type: 'unpushed' | 'pullchanges') {
    const self = this;
    function unpushedChanges() {
      return html`${RestrictedIcon}
        <div>
          You have not pushed, Only pushed content are shared to the blog.
        </div>
        <div class="snackbar-action">Learn more</div>`;
    }

    function pullChanges() {
      return html`
        <div>The origin of this block as been updated</div>
        <div
          class="snackbar-action"
          @click=${() => {
            const resp = confirm('This may overwrite the content of the page.');
            if (resp) {
              self.pull();
              self.showSnackBar = false;
            }
          }}
        >
          Update Now
        </div>
      `;
    }

    return html`<div class="snackbar-cont">
      <div class="snackbar">
        ${(function () {
          switch (type) {
            case 'pullchanges':
              return pullChanges();
            case 'unpushed':
              return unpushedChanges();
          }
        })()}
        <div
          class="snackbar-action"
          @click=${() => (this.showSnackBar = false)}
        >
          ${CloseIcon}
        </div>
      </div>
    </div>`;
  }
  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`
      <div class="page-container">
        ${this.renderTopNav()}
        <documents-editor
          id="doc-editor"
          uref=${this.pageId}
          ?read-only=${this.readOnly}
        >
        </documents-editor>

        ${this.hasPull && this.showSnackBar
          ? this.renderSnackBar('pullchanges')
          : null}
      </div>
    `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          margin: 0 auto;
          width: 100%;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          max-height: 100vh;
          overflow-y: auto;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
          padding-bottom: 30vmin;
        }
        .app-action-bar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 1rem;
          padding-top: 1rem;
          font-weight: 400;
          font-size: 1.1rem;
        }
        .app-action-bar > * {
          margin: 0 0.5rem;
        }
        .snackbar-cont {
          font-family: 'Inter', sans-serif;
          position: absolute;

          background: #0ff;
          bottom: 10%;
          /* top: 50%; */
          left: 50%;
          transform: translate(-50%, -50%);

          background: #262641;
          /* Alert Shadow */

          box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15),
            0px 4px 8px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        .snackbar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-left: 1rem;
          color: #fafcfe;
        }
        .snackbar > * {
          padding: 0.5rem;
        }
        .snackbar-action {
          padding: 0.5rem 1rem;
          border-left: 1px solid #fff6;
          cursor: pointer;
          transition: all 0.2s ease;
          align-items: center;
          justify-content: center;
          display: flex;
          font-weight: bold;
        }
        .snackbar-action:hover {
          background: #fff3;
        }
      `,
    ];
  }
}
