import { Entity } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../services/connected.element';
import { sharedStyles } from '../styles';
import { Section } from './types';
import { GenerateReadDocumentRoute } from '../utils/routes.helpers';
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

  @internalProperty()
  lastSharedPageId: string = null;
  sections: SectionData[];

  firstUpdated() {
    this.load();
  }

  async copyShareURL() {
    try {
      await window.navigator.clipboard.writeText(
        `${window.location.origin}${GenerateReadDocumentRoute(
          this.lastSharedPageId
        )}`
      );
    } catch (e) {
      console.error(e);
    }
  }

  updated(changedProperties) {
    if (
      changedProperties.has('uref') &&
      changedProperties.get('uref') !== undefined
    ) {
      this.load();
    }
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
    const forks = await this.appManager.getForkedIn(this.uref);
    console.log({ forks });
    this.loading = false;
  }

  async shareTo(toSectionId: string) {
    const sharedURI = await this.appManager.forkPage(this.uref, toSectionId);
    this.lastSharedPageId = sharedURI;
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;
    return html`<div class="share-card-cont">
      ${this.lastSharedPageId
        ? html` <div class="action-copy-cont">
            <div class="url-cont">
              ${window.location.origin}${GenerateReadDocumentRoute(
                this.lastSharedPageId
              )}
            </div>
            <div @click=${this.copyShareURL} class="copy-url-button clickable">
              COPY
            </div>
          </div>`
        : null}
      <div class="content">
        <div class="row">
          <div class="heading">Add to</div>
        </div>
        <div class="row">
          <div class="description">
            Sharing is done by adding a copy of this page somewhere else.
          </div>
        </div>
        <div class="row section-row">
          ${this.sections.map((section) => {
            return html`<div class="add-cont">
              <div>${section.data.object.title}:</div>
              <uprtcl-button @click=${() => this.shareTo(section.id)}
                >Add</uprtcl-button
              >
            </div>`;
          })}
        </div>
      </div>
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          font-family: 'Poppins', sans-serif;
        }
        .share-card-cont {
          width: 300px;
        }
        .content {
          padding: 0.5rem 1rem 1rem;
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
        .add-cont {
          width: 100%;
          margin: 1rem 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
      `,
    ];
  }
}

// <!-- .disabled=${this.permissions.delegate} -->
// <!-- @toggle-click=${this.togglePublicWrite}></uprtcl-toggle -->
