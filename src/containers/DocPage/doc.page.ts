import { html, css, internalProperty, property, query } from 'lit-element';
import { styles } from '@uprtcl/common-ui';
import { Secured, Perspective, Evees } from '@uprtcl/evees';
import { DocumentEditor } from '@uprtcl/documents';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

import MoreHorizontalIcon from '../../assets/icons/more-horizontal.svg';

export class DocumentPage extends ConnectedElement {
  @property({ type: String, attribute: 'page-id' })
  pageId: string;

  @internalProperty()
  hasPull = false;

  @internalProperty()
  loading = true;

  @query('#doc-editor')
  documentEditor: DocumentEditor;

  @property()
  isPagePrivate: boolean = true;

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
    this.hasPull = false;
    const { details } = await this.evees.client.getPerspective(this.pageId);
    // Compare details.guardianId with privateSectionPerspective.id to know if private or blog page.

    const perspective = await this.evees.client.store.getEntity(this.pageId);

    if (
      perspective.object.payload.meta &&
      perspective.object.payload.meta.forking
    ) {
      // this page is a fork of another
      this.originId = perspective.object.payload.meta.forking.perspectiveId;
      this.checkOrigin();
    }

    const sectionsList = await this.appManager.getSections();

    if (details.guardianId && details.guardianId == sectionsList[1]) {
      this.isPagePrivate = false;
    }

    this.loading = false;
  }

  async checkOrigin() {
    const config = {
      forceOwner: true,
    };

    // Create a temporary workspaces to compute the merge
    this.eveesPull = this.evees.clone();

    await this.evees.merge.mergePerspectivesExternal(
      this.pageId,
      this.originId,
      this.eveesPull,
      config
    );

    // see if the temporary workspaces has updated any perspective
    const diff = await this.eveesPull.client.diff();
    this.hasPull = diff.updates ? diff.updates.length > 0 : false;
  }

  async pull() {
    await this.eveesPull.client.flush();
    this.checkOrigin();
    this.documentEditor.reload();
  }

  renderTopNav() {
    return html`<div class="app-action-bar">
      <uprtcl-popper>
        <div slot="icon">Share</div>
        <share-card
          uref=${this.pageId}
          from=${this.privateSectionPerspective.id}
          .isPagePrivate=${this.isPagePrivate}
        ></share-card>
      </uprtcl-popper>

      ${this.hasPull
        ? html`<uprtcl-button
            @click=${() => {
              const resp = confirm(
                'This may overwrite the content of the page.'
              );
              if (resp) {
                this.pull();
              }
            }}
            >Pull</uprtcl-button
          >`
        : ``}
      <div>${MoreHorizontalIcon}</div>
    </div>`;
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`
      <div class="page-container">
        ${this.renderTopNav()}
        <documents-editor id="doc-editor" uref=${this.pageId}>
        </documents-editor>
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
          overflow: scroll;
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
      `,
    ];
  }
}
