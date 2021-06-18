import { html, css, internalProperty } from 'lit-element';
import { Lens } from '@uprtcl/evees-ui';
import { Entity, Perspective, Secured } from '@uprtcl/evees';
import { icons, MenuOptions } from '@uprtcl/common-ui';

import { sharedStyles, tableStyles } from '../../../styles';
import { GenerateUserRoute } from '../../../utils/routes.helpers';
import { TimestampToDate } from '../../../utils/date';

import { BlockAction, BlockItemBase } from './block.item.base';

export class GridCardItem extends BlockItemBase {
  @internalProperty()
  loading: boolean = true;

  actionOptions: MenuOptions = new Map();

  title: string | undefined;
  previewLense: Lens | undefined;

  data: Entity;
  perspective: Secured<Perspective>;

  async firstUpdated() {
    await this.load();
  }

  async load() {
    this.loading = true;

    this.data = await this.evees.getPerspectiveData(this.uref);
    this.perspective = await this.evees.getEntity(this.uref);

    this.title = this.evees.tryBehaviorFirst(this.data.object, 'title');
    this.previewLense = this.evees.tryBehaviorFirst(
      this.data.object,
      'preview'
    );

    this.loading = false;
  }

  render() {
    if (this.loading) {
      return html`<evees-loading></evees-loading>`;
    }

    const creatorId = this.perspective.object.payload.creatorId;
    const remote = this.perspective.object.payload.remote;

    return html`
      <div class="cont">
        <div class="card-top-row">
          <a href=${GenerateUserRoute(creatorId)} target="_blank">
            <app-user-profile
              user-id=${creatorId}
              remote-id=${remote}
              show-name
            ></app-user-profile>
          </a>
        </div>
        <div class="card-content">
          ${this.previewLense
            ? this.previewLense.render(this.uref)
            : html`<h3>${this.title}</h3>`}
        </div>
        <div class="card-footer">
          ${this.config.itemConfig.showActions
            ? html`<div class="actions">
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
              </div>`
            : ''}
          ${this.config.itemConfig.showDate
            ? html`<div class="date">
                ${TimestampToDate(this.perspective.object.payload.timestamp)}
              </div>`
            : ''}
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
          padding-top: 0rem;
          padding-bottom: 0.75rem;
          position: relative;
        }
        .card-top-row {
          margin-bottom: 1rem;
        }
        .card-content {
          min-height: var(--content-min-height, 40px);
          margin-bottom: 1rem;
        }
        .card-footer {
          font-size: 13px;
          color: #0000005e;
          font-weight: 500;
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
