import { html, css, property, internalProperty } from 'lit-element';
import lodash from 'lodash';

import { Entity } from '@uprtcl/evees';

import { ConnectedElement } from '../services/connected.element';
import { sharedStyles } from '../styles';
import { Concept_TextNode, Section } from './types';
import ClipboardIcon from '../assets/icons/clipboard.svg';
import { GenerateReadDocumentRoute } from '../utils/routes.helpers';
import { LTRouter } from '../router';
import { ConceptId } from 'src/services/app.manager';

interface SectionData {
  id: string;
  data: Entity<Section>;
}

export default class ShareCard extends ConnectedElement {
  @property({ type: String })
  uref: string;

  @internalProperty()
  isPagePrivate: boolean;

  @property({ type: String, attribute: 'from' })
  fromParentId: string;

  @internalProperty()
  loading: boolean = true;

  @internalProperty()
  disableAddButton: boolean = false;

  @internalProperty()
  lastSharedPageId: string = null;

  @internalProperty()
  addingPage = false;

  @internalProperty()
  hasPush = false;

  sections: SectionData[];

  firstUpdated() {
    this.load();
  }

  async copyShareURL() {
    try {
      await window.navigator.clipboard.writeText(
        `${window.location.origin}${GenerateReadDocumentRoute(
          this.lastSharedPageId
            ? this.lastSharedPageId
            : (LTRouter.Router.location.params.docId as string)
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
    // alert(this.isPagePrivate);
    this.lastSharedPageId = null;
    this.disableAddButton = false;
    this.hasPush = false;

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

    const { details } = await this.evees.client.getPerspective(this.uref);

    const privateSectionPerspective = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    const BlogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );
    if (
      details.guardianId &&
      details.guardianId != privateSectionPerspective.id
    ) {
      this.isPagePrivate = false;
    } else {
      this.isPagePrivate = true;
    }

    const forkedIn = await this.appManager.getForkedIn(this.uref);

    const inBlogIx = forkedIn.findIndex((e) => e.parentId === BlogSection.id);
    if (inBlogIx !== -1) {
      const parentAndChild = forkedIn[inBlogIx];
      console.log({ forkId: parentAndChild.childId });
      const PreviouslyForkedIn = lodash.find(
        forkedIn,
        (obj) => obj.parentId == BlogSection.id
      );
      if (PreviouslyForkedIn) {
        this.lastSharedPageId = PreviouslyForkedIn.childId;
      }
      this.disableAddButton = true;

      const workspace = await this.appManager.compareForks(
        PreviouslyForkedIn.childId,
        this.uref
      );
      this.hasPush = await this.appManager.workspaceHasChanges(workspace);
    }

    this.loading = false;
  }

  async shareTo(toSectionId: string) {
    this.addingPage = true;
    const sharedURI = await this.appManager.forkPage(this.uref, toSectionId);

    const data = await this.evees.getPerspectiveData<Concept_TextNode>(sharedURI);
    const blogConcept = await this.appManager.getConcept(ConceptId.BLOGPOST);

    const newObject: Concept_TextNode = {
      ...data.object,
      meta: {
        isA: data.object.meta.isA.concat([blogConcept.id]),
      },
    };

    await this.evees.updatePerspectiveData(sharedURI, newObject);

    this.lastSharedPageId = sharedURI;
    this.disableAddButton = true;
    this.addingPage = false;
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;
    return html`<div class="share-card-cont">
      <div class="content">
        <div class="row">
          <div class="heading">
            ${this.isPagePrivate ? html`Add to blog` : html`Share to Web`}
          </div>
        </div>
        <div class="row">
          <div class="description">
            ${this.isPagePrivate
              ? html`Share this page by forking it in your Blog section`
              : html`Anyone with this link can view this page.`}
          </div>
        </div>
      </div>
      ${this.isPagePrivate
        ? html`<uprtcl-button-loading
              class="add-to-blog-button"
              @click=${() =>
                !this.disableAddButton ? this.shareTo(this.sections[0].id) : {}}
              ?disabled=${this.disableAddButton}
              ?loading=${this.addingPage}
            >
              ${this.disableAddButton ? html`Added` : html`Add`}
            </uprtcl-button-loading>
            ${this.hasPush ? html`<!--div>TODO: Push button</div -->` : ''}`
        : html` <div class="action-copy-cont">
            <div class="url-cont">
              ${window.location.origin}${GenerateReadDocumentRoute(
                LTRouter.Router.location.params.docId as string
              )}
            </div>
            <div @click=${this.copyShareURL} class="copy-url-button clickable">
              ${ClipboardIcon}
            </div>
          </div>`}
      ${this.lastSharedPageId && this.isPagePrivate
        ? html` <div class="action-copy-cont">
            <div class="url-cont">
              ${window.location.origin}${GenerateReadDocumentRoute(
                this.lastSharedPageId
              )}
            </div>
            <div @click=${this.copyShareURL} class="copy-url-button clickable">
              ${ClipboardIcon}
            </div>
          </div>`
        : null}
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
          width: 350px;
        }
        .content {
          padding: 0.5rem 1rem 0rem;
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
        .add-to-blog-button {
          width: 120px;
          margin: 1rem;
        }

        .action-copy-cont {
          margin: 1rem;
          display: flex;

          /* Accent */

          background: #ecf1f4;
          /* Gray 5 */

          border: 1px solid #e0e0e0;
          box-sizing: border-box;
          /* Field/Inset */

          box-shadow: inset 0px 2px 2px -1px rgba(74, 74, 104, 0.1);
          border-radius: 0.5rem;
        }
        .url-cont {
          overflow-x: scroll;
          padding: 0 0.5rem;
          color: #4c4c5a;
          font-size: 0.9rem;
          display: flex;
          justify-content: start;
          align-items: center;
          margin: 0 0.25rem;
        }
        .url-cont::-webkit-scrollbar {
          height: 4px;
        }

        /* Track */
        .url-cont::-webkit-scrollbar-track {
          background: #f1f1f1;
          height: 4px;
        }

        /* Handle */
        .url-cont::-webkit-scrollbar-thumb {
          background: #ccc;
          height: 4px;
        }

        /* Handle on hover */
        .url-cont::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .copy-url-button {
          background: var(--white, #fff);
          align-items: center;
          justify-content: center;
          display: flex;
          padding: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
      `,
    ];
  }
}

// <!-- .disabled=${this.permissions.delegate} -->
// <!-- @toggle-click=${this.togglePublicWrite}></uprtcl-toggle -->
