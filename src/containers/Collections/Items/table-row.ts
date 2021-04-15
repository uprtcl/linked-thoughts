import { html, css, property, internalProperty } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles, tableStyles } from '../../styles';
import MinusIcon from '../../assets/icons/minus.svg';
import MoveToIcon from '../../assets/icons/move-to.svg';
import DuplicateIcon from '../../assets/icons/duplicate.svg';
import {
  GenerateDocumentRoute,
  GenerateUserRoute,
} from '../../utils/routes.helpers';
import { TimestampToDate } from '../../utils/date';

const MAX_DESCRIPTION_LENGTH = 250;
const MAX_TITLE_LENGTH = 50;

export const PAGE_SELECTED_EVENT_NAME = 'page-selected';
export class GridCardItem extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @property({ type: String })
  viewType: 'list' | 'grid';

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

    // const title = this.evees.behaviorFirst(ForkData.object, 'titleHtml');
    // const previewLense = this.evees.behaviorFirst(ForkData.object, 'preview');

    const perspectiveData = await this.appManager.draftsEvees.client.store.getEntity(
      this.uref
    );
    this.perspectiveData = perspectiveData;

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

  async handleAddToClipboard() {
    const clipboardSection = await this.appManager.elements.get(
      '/linkedThoughts/clipboardSection'
    );

    await this.appManager.addToClipboard(this.uref, clipboardSection.id, true);

    // const x = await this.evees.getPerspectiveData(clipboardSection.id);
  }

  derivedTitle() {
    if (
      this.forkData.object.text.startsWith('<img') &&
      this.viewType === 'list'
    )
      return '<i>Image<i>';
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
    if (this.viewType === 'list') {
      return html`
        <div class="table_small">
          <a href=${GenerateDocumentRoute(this.uref)} target="_blank">
            <div class="table_cell">${unsafeHTML(this.derivedTitle())}</div>
          </a>
        </div>
        <div class="table_small">
          <div class="table_cell">
            ${TimestampToDate(this.perspectiveData.object.payload.timestamp)}
          </div>
        </div>
        <div class="table_small">
          <div class="table_cell">
            <a
              href=${GenerateUserRoute(
                this.perspectiveData.object.payload.creatorId
              )}
              target="_blank"
            >
              ${this.perspectiveData.object.payload.creatorId}
            </a>
          </div>
        </div>
      `;
    } else {
      // <!-- ${this.type === 'title' ? this.titleHtml : null} -->
      // <!-- ${this.preview.render({ uref: this.uref })}   -->
      return html`
        <div class="cont">
          <div class="card-content">
            ${this.type === 'title'
              ? html`<h3>${unsafeHTML(this.derivedTitle())}</h3>`
              : html`<p class="description">
                  ${unsafeHTML(this.deriveDescription())}
                </p>`}
          </div>
          <div class="card-footer">
            <a
              href=${GenerateUserRoute(
                this.perspectiveData.object.payload.creatorId
              )}
              target="_blank"
            >
              <p class="author">
                ${this.perspectiveData.object.payload.creatorId}
              </p>
            </a>
            <div class="actions">
              <div>${MinusIcon} <span>Remove</span></div>

              <div class="clickable" @click=${this.handleAddToClipboard}>
                ${DuplicateIcon} <span>Add To Clipboard</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  static get styles() {
    return [
      sharedStyles,
      tableStyles,
      css`
        :host {
          font-family: 'Inter';
          height: 100%;
          display: table-row;
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
          font-size: 1rem;
        }
        .card-content {
          min-height: 120px;
        }
        .card-footer {
        }
        .description img {
          max-height: 100px;
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
        .list-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        .list-row-title {
          flex: 1;
        }
      `,
    ];
  }
}
