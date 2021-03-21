import { html, css, property, internalProperty } from 'lit-element';

import {
  ClientEvents,
  Entity,
  Evees,
  EveesMutation,
  Logger,
  Perspective,
  Secured,
  ClientCachedEvents,
  EveesEvents,
} from '@uprtcl/evees';

import { ConnectedElement } from '../services/connected.element';
import { sharedStyles } from '../styles';
import { ThoughtsTextNode, Section } from './types';
import ClipboardIcon from '../assets/icons/clipboard.svg';
import { LTRouter } from '../router';
import { ConceptId } from '../services/app.manager';
import { GenearateReadURL } from '../utils/routes.generator';

interface SectionData {
  id: string;
  data: Entity<Section>;
}

export default class ShareCard extends ConnectedElement {
  logger = new Logger('ShareCard');

  @property({ type: String })
  uref: string;

  @internalProperty()
  isPagePrivate: boolean;

  @property({ type: String, attribute: 'from' })
  fromParentId: string;

  @internalProperty()
  loading: boolean = true;

  @internalProperty()
  lastSharedPageId: string = null;

  @internalProperty()
  addingPage = false;

  @internalProperty()
  forkId: string | undefined = undefined;

  @internalProperty()
  pushDiff!: EveesMutation;

  @internalProperty()
  pushing = false;

  @internalProperty()
  clientPending = false;

  @internalProperty()
  eveesPending = false;

  sections: SectionData[];
  privateSection!: Secured<Perspective>;
  blogSection!: Secured<Perspective>;

  // Evees service storing changes from private to blog
  eveesPush!: Evees;

  blockUpdates: boolean = false;
  pendingUpdates: boolean = false;

  firstUpdated() {
    if (this.appManager.draftsEvees.client.events) {
      this.appManager.draftsEvees.client.events.on(
        ClientEvents.ecosystemUpdated,
        (perspectiveIds: string[]) => this.ecosystemUpdated(perspectiveIds)
      );

      this.appManager.draftsEvees.client.events.on(
        ClientCachedEvents.pending,
        (pending: boolean) => {
          /** set pending off after client flushed */
          if (!pending) {
            this.clientPending = pending;
          }
        }
      );

      this.appManager.draftsEvees.events.on(
        EveesEvents.pending,
        (pending: boolean) => {
          /** set pending on after evees debounce */
          this.eveesPending = pending;
        }
      );
    }

    this.load();
  }

  ecosystemUpdated(perspectiveIds: string[]) {
    if (perspectiveIds.includes(this.uref)) {
      this.logger.log('ecosystemUpdated()');
      this.debounceUpdateChanges();
    }
  }

  debounceUpdateChanges() {
    this.pendingUpdates = true;

    if (!this.blockUpdates) {
      this.blockUpdates = true;
      this.pendingUpdates = false;

      this.loadChanges();

      setTimeout(() => {
        this.blockUpdates = false;
        if (this.pendingUpdates) {
          this.loadChanges();
        }
      }, 2500);
    } else {
      this.logger.log('blockUpdates is true');
    }
  }

  /** resolves once pending is false */
  async ready() {
    if (!this.eveesPending && !this.clientPending) return;

    const resolveFn = (resolve: Function) => {
      resolve();
    };

    await new Promise<void>((resolve) => {
      this.appManager.draftsEvees.client.events.on(
        ClientCachedEvents.pending,
        (pending: boolean) => {
          if (!pending) {
            if (!this.eveesPending) {
              /** resolve if the draft Evees is also ready */
              resolveFn(resolve);
            }

            /** auto remove listener */
            this.appManager.draftsEvees.client.events.removeListener(
              ClientCachedEvents.pending,
              resolveFn
            );
          }
        }
      );

      this.appManager.draftsEvees.events.on(
        EveesEvents.pending,
        (pending: boolean) => {
          if (!pending) {
            if (!this.clientPending) {
              /** resolve if the client is also ready */
              resolveFn(resolve);
            }

            /** auto remove listener */
            this.appManager.draftsEvees.events.removeListener(
              ClientCachedEvents.pending,
              resolveFn
            );
          }
        }
      );
    });
  }

  async copyShareURL() {
    try {
      await window.navigator.clipboard.writeText(
        `${GenearateReadURL(
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
    this.forkId = undefined;

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

    const { details } = await this.appManager.draftsEvees.client.getPerspective(
      this.uref
    );

    this.privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.blogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );

    if (details.guardianId && details.guardianId != this.privateSection.id) {
      this.isPagePrivate = false;
    } else {
      this.isPagePrivate = true;
    }

    await this.loadForks();

    this.loading = false;
  }

  async loadForks() {
    const forkedIn = await this.appManager.getForkedIn(this.uref);
    const forksInBlog = forkedIn.filter(
      (e) => e.parentId === this.blogSection.id
    );

    if (forksInBlog.length > 0) {
      this.forkId = forksInBlog[0].childId;
      await this.loadChanges();
    }
  }

  async loadChanges() {
    this.logger.log('loadChanges()', { forkId: this.forkId });
    if (this.forkId) {
      this.eveesPush = await this.appManager.compareForks(
        this.forkId,
        this.uref
      );
      this.pushDiff = await this.eveesPush.client.diff();
      this.logger.log('loadChanges() - done', { pushDiff: this.pushDiff });
    } else {
      this.pushDiff = {
        deletedPerspectives: [],
        entities: [],
        newPerspectives: [],
        updates: [],
      };
    }
  }

  get nChanges() {
    if (!this.pushDiff) return 0;

    return (
      this.pushDiff.deletedPerspectives.length +
      this.pushDiff.newPerspectives.length +
      this.pushDiff.updates.length
    );
  }

  toggleBlogVersion() {
    if (this.forkId) {
      // delete
    } else {
      this.shareTo(this.blogSection.id);
    }
  }

  navToBlogVersion() {}

  async shareTo(toSectionId: string) {
    await this.ready();

    if (this.addingPage) return;

    this.addingPage = true;
    const forkId = await this.appManager.forkPage(
      this.uref,
      toSectionId,
      false
    );

    const data = await this.evees.getPerspectiveData<ThoughtsTextNode>(forkId);
    const blogConcept = await this.appManager.getConcept(ConceptId.BLOGPOST);

    /** keep the the entire object and append the blogConcept to the isA array. */
    const newObject: ThoughtsTextNode = { ...data.object };
    newObject.meta = {
      isA: [blogConcept.id],
    };

    await this.evees.updatePerspectiveData({
      perspectiveId: forkId,
      object: newObject,
    });
    await this.evees.flush();

    this.lastSharedPageId = forkId;

    this.loadForks();
    this.addingPage = false;
  }

  async pushChanges() {
    if (this.pushing) return;
    await this.ready();

    this.pushing = true;
    /** flush from onmemory to local */
    await this.eveesPush.client.flush({}, false);
    await this.appManager.commitPage(this.uref);

    this.pushing = false;
    this.loadForks();
  }

  renderPrivatePage() {
    return html`<div class="row">
        <div class="column description-column">
          <div class="row">
            <div class="heading">
              ${this.isPagePrivate ? html`Share to blog` : html`Share to Web`}
            </div>
          </div>
          <div class="row">
            <div class="description">
              ${this.isPagePrivate
                ? html`Sharing to blog creates a public "fork" of this page in
                  your blog`
                : html`Anyone with this link can view this page.`}
            </div>
          </div>
        </div>
        <div class="column center-items">
          <uprtcl-toggle
            @click=${() => this.toggleBlogVersion()}
            ?active=${this.forkId !== undefined}
          >
          </uprtcl-toggle>
        </div>
      </div>
      ${this.pushDiff && this.pushDiff.updates.length > 0
        ? html`<div class="separator"></div>
            <div>
              <div class="row description">
                (${this.nChanges}) ${' '} Changes made since last push
              </div>
            </div>
            <div class="row buttons">
              <uprtcl-button-loading
                ?loading=${this.pushing}
                @click=${() => this.pushChanges()}
                >Push to Blog</uprtcl-button-loading
              >
              <div class="item-separator"></div>
              <uprtcl-button disabled>View Changes</uprtcl-button>
              <div class="item-separator"></div>
              <uprtcl-button skinny @click=${() => this.navToBlogVersion()}
                >See Version</uprtcl-button
              >
            </div>`
        : html``} `;
  }

  renderBlogPage() {
    return html`<div class="row description">
        This is the public version of this document. Use this link to share it
        with others.
      </div>
      <div class="action-copy-cont">
        <div class="url-cont">
          ${GenearateReadURL(LTRouter.Router.location.params.docId as string)}
        </div>
        <div @click=${this.copyShareURL} class="copy-url-button clickable">
          ${ClipboardIcon}
        </div>
      </div>`;
  }

  renderContent() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;
    return html`<div class="share-card-cont">
      ${this.isPagePrivate ? this.renderPrivatePage() : this.renderBlogPage()}
      ${this.lastSharedPageId && this.isPagePrivate
        ? html` <div class="action-copy-cont">
            <div class="url-cont">
              ${GenearateReadURL(this.lastSharedPageId)}
            </div>
            <div @click=${this.copyShareURL} class="copy-url-button clickable">
              ${ClipboardIcon}
            </div>
          </div>`
        : null}
    </div>`;
  }

  render() {
    return html`${this.eveesPending || this.clientPending
        ? html`<div>pending</div>`
        : ''}
      <uprtcl-popper>
        <uprtcl-button slot="icon" skinny secondary
          >${`${
            this.forkId === undefined
              ? 'Share'
              : `Share${this.nChanges > 0 ? ` (${this.nChanges})` : ''}`
          }`}</uprtcl-button
        >
        ${this.renderContent()}
      </uprtcl-popper>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }
        .share-card-cont {
          width: 350px;
          padding: 1rem 1rem 1.5rem 1rem;
        }
        .content {
          padding: 0.5rem 1rem 0rem;
        }
        .description-column {
          padding-right: 30px;
        }
        .heading {
          font-size: 1.2rem;
          font-weight: 600;
          line-height: 2;
        }
        .description {
          font-size: 1rem;
          font-weight: 400;
          color: var(--gray-light, black);
        }
        .separator {
          width: 100%;
          border-top-style: solid;
          border-width: 0.6px;
          border-color: #bdbdbd;
          margin: 12px 0px;
        }
        .buttons {
          margin-top: 12px;
        }
        .buttons uprtcl-button {
          flex: 1 1 auto;
          --padding: 0px 0px;
        }
        .item-separator {
          width: 12px;
          height: 100%;
          flex: 0 0 auto;
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
          margin-top: 1rem;
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
