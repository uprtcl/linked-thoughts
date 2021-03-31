import { Commit, Signed } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import MinusIcon from '../../assets/icons/minus.svg';
import MoveToIcon from '../../assets/icons/move-to.svg';
import DuplicateIcon from '../../assets/icons/duplicate.svg';
import { GenerateUserRoute } from '../../utils/routes.helpers';
import { Router } from '@vaadin/router';

import { TimestampToDate } from '../../utils/date';
const MAX_DESCRIPTION_LENGTH = 170;
const MAX_TITLE_LENGTH = 50;

export const PAGE_SELECTED_EVENT_NAME = 'page-selected';
export class ForkItem extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @internalProperty()
  loading: boolean = true;

  forkData;
  perspectiveData;

  type;
  async firstUpdated() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const ForkData = await this.evees.getPerspectiveData(this.uref);
    this.forkData = ForkData;
    const perspectiveData = await this.appManager.draftsEvees.client.store.getEntity(
      this.uref
    );
    this.perspectiveData = perspectiveData;
    // debugger;

    switch (this.forkData.object.type) {
      case 'Title':
        this.type = 'title';
        break;
      case 'Paragraph':
        this.type = 'paragraph';
        break;
    }
    if (this.forkData.object.text.startsWith('<img')) {
      this.type = 'image';
      this.forkData.object.type = 'Image';
    }
    this.loading = false;
  }
  derivedTitle() {
    return this.forkData.object.text.startsWith('<img')
      ? ''
      : this.forkData.object.text
          .substring(0, MAX_TITLE_LENGTH)
          .replace(/<[^>]*>?/gm, '');
  }
  deriveDescription() {
    return this.forkData.object.text.length > MAX_DESCRIPTION_LENGTH
      ? this.forkData.object.text.substring(0, MAX_DESCRIPTION_LENGTH) + '...'
      : this.forkData.object.text;
  }

  renderLabel() {
    let typeClass;
    switch (this.type) {
      case 'title':
        typeClass = 'type-title';
        break;
      case 'image':
        typeClass = 'type-image';
        break;
      case 'paragraph':
        typeClass = 'type-paragraph';
        break;
    }

    return html` <p class=${'type-label' + ' ' + typeClass}>
      ${this.forkData.object.type.toUpperCase()}
    </p>`;
  }
  render() {
    if (this.loading) {
      return html`<evees-loading></evees-loading>`;
    }

    return html`<div class="cont">
      ${this.renderLabel()}
      <h3>${this.derivedTitle()}</h3>
      <p class="description">${unsafeHTML(this.deriveDescription())}</p>
      <a
        href=${GenerateUserRoute(this.perspectiveData.object.payload.creatorId)}
        target="_blank"
      >
        <p class="author">${this.perspectiveData.object.payload.creatorId}</p>
      </a>
      <div class="actions">
        <div>${MinusIcon} <span>Remove</span></div>
        <div>${MoveToIcon} <span>Remove</span></div>
        <div>${DuplicateIcon} <span>Remove</span></div>
      </div>
    </div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          font-family: 'Inter';
          height: 100%;
        }
        .cont {
          padding-top: 1rem;
          padding-bottom: 1.5rem;
          position: relative;
        }
        .type-label {
          background: #a37c17aa;
          width: fit-content;
          padding: 2px 5px;
          font-size: 0.8rem;
          font-weight: 600;

          color: #fafafa;
        }
        .type-image {
          background: #a37c17aa;
        }
        .type-title {
          background: #576cce;
        }
        .type-paragraph {
          background: #822699;
        }
        .description {
          color: #828282;
          font-size: 0.9rem;
        }
        .description img {
          max-height: 300px;
        }
        .author {
          font-family: Poppins;
          font-style: normal;
          font-weight: 500;
          font-size: 13px;
          line-height: 19px;
          /* identical to box height */
          color: #de5163;
        }
        .actions {
          margin-top: 0.25rem;
          display: flex;
          color: #9797aa;
          bottom: 0;
        }
        .actions > * {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 3%;
          font-size: 0.9rem;
        }
        .actions span {
          margin-left: 0.25rem;
        }
      `,
    ];
  }
}
