import { html, css, internalProperty, property } from 'lit-element';
import { styles } from '@uprtcl/common-ui';
import { Secured, Perspective } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

import MoreHorizontalIcon from '../../assets/icons/more-horizontal.svg';

export class DocumentPage extends ConnectedElement {
  @property({ type: String, attribute: 'page-id' })
  pageId: string;

  @internalProperty()
  loading = true;

  privateSectionPerspective: Secured<Perspective>;

  async firstUpdated() {
    this.privateSectionPerspective = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.load();
  }

  async load() {
    const { details } = await this.evees.client.getPerspective(this.pageId);
    // Compare guardianId with privateSectionPerspective.id to know if private or blog page.
    this.loading = false;
  }

  renderTopNav() {
    return html`<div class="app-action-bar">
      <uprtcl-popper>
        <div slot="icon">Share</div>
        <share-card
          uref=${this.pageId}
          from=${this.privateSectionPerspective.id}
        ></share-card>
      </uprtcl-popper>
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
      `,
    ];
  }
}
