import { Entity } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../services/connected.element';
import { Section } from './types';

interface SectionData {
  id: string;
  data: Entity<Section>;
}
export default class ShareCard extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @property({ type: String, attribute: 'from' })
  fromParentId: string;

  @internalProperty()
  loading: boolean = true;

  sections: SectionData[];

  firstUpdated() {
    this.load();
  }

  async load() {
    const sectionIds = await this.appManager.getSections();
    this.sections = await Promise.all(
      sectionIds
        .filter((id) => id !== this.fromParentId)
        .map(
          async (id): Promise<SectionData> => {
            const data = await this.evees.getPerspectiveData(id);
            return {
              id,
              data,
            };
          }
        )
    );
    this.loading = false;
  }

  async shareTo(toSectionId: string) {
    await this.appManager.forkPage(this.uref, toSectionId);
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;
    return html`<div class="share-card-cont">
      <div class="content">
        <div>
          <div class="heading">Add to:</div>
          <div class="description">
            Sharing is done by adding a copy of this page somewhere else.
          </div>
        </div>
        <div class="toggle-cont">
          ${this.sections.map((section) => {
            return html`<div>${section.data.object.title}</div>
              <uprtcl-button
                @click=${() => this.shareTo(section.id)}
              ></uprtcl-button>`;
          })}
        </div>
      </div>
    </div>`;
  }

  static get styles() {
    return css`
      :host {
        font-family: 'Poppins', sans-serif;
      }
      .share-card-cont {
        background-color: var(--white, #ffffff);
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
      }
      .content {
        padding: 0.5rem 1rem 1rem;
        display: flex;
      }
      .heading {
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 2;
      }
      .description {
        font-size: 1rem;
        font-weight: 400;
      }
      .toggle-cont {
        margin-left: 1rem;
        display: flex;
        align-items: center;
      }
    `;
  }
}

// <!-- .disabled=${this.permissions.delegate} -->
// <!-- @toggle-click=${this.togglePublicWrite}></uprtcl-toggle -->
