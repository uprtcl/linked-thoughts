import { html, css, property, internalProperty } from 'lit-element';
import { Lens } from '@uprtcl/evees-ui';
import { Entity, Perspective, Secured } from '@uprtcl/evees';
import { icons, MenuOptions } from '@uprtcl/common-ui';

import { sharedStyles, tableStyles } from '../../../styles';
import { GenerateUserRoute } from '../../../utils/routes.helpers';

import { BlockAction, BlockItemBase } from './block.item.base';

export class GridCardItem extends BlockItemBase {
  @property({ type: String })
  uref: string;

  @internalProperty()
  loading: boolean = true;

  actionOptions: MenuOptions = new Map();

  title: string;
  previewLense: Lens;

  data: Entity;
  perspective: Secured<Perspective>;

  async firstUpdated() {
    await this.load();
  }

  async load() {
    this.loading = true;

    this.data = await this.evees.getPerspectiveData(this.uref);
    this.perspective = await this.evees.client.store.getEntity(this.uref);

    this.title = this.evees.behaviorFirst(this.data.object, 'title');
    this.previewLense = this.evees.behaviorFirst(this.data.object, 'preview');

    this.loading = false;
  }

  render() {
    if (this.loading) {
      return html`<evees-loading></evees-loading>`;
    }

    return html`
      <div class="cont">
        <div class="card-content">
          ${this.previewLense
            ? this.previewLense.render(this.uref)
            : html`<h3>${this.title}</h3>`}
        </div>
        <div class="card-footer">
          <a
            href=${GenerateUserRoute(this.perspective.object.payload.creatorId)}
            target="_blank"
          >
            <p class="author">${this.perspective.object.payload.creatorId}</p>
          </a>
          <div class="actions">
            ${Array.from(this.actionOptions.entries()).map(
              ([itemKey, item]) => {
                return html`<div
                  class="clickable"
                  @click=${() => this.handleAction(itemKey as BlockAction)}
                >
                  ${icons[item.icon]}<span>${item.text}</span>
                </div>`;
              }
            )}
          </div>
        </div>
      </div>
    `;
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
