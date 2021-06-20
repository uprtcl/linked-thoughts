import { html, css, internalProperty, property, query } from 'lit-element';
import { icons, styles } from '@uprtcl/common-ui';
import {
  Secured,
  Perspective,
  Evees,
  ClientEvents,
  EveesEvents,
  Logger,
  ParentAndChild,
  EveesMutation,
  Entity,
} from '@uprtcl/evees';
import { DocumentEditor } from '@uprtcl/documents';
import { Router } from '@vaadin/router';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

import { GenerateDocumentRoute } from '../../utils/routes.helpers';
import { GenearateReadURL } from '../../utils/routes.generator';
import { LTRouter } from '../../router';

import { Section } from '../types';

interface SectionData {
  id: string;
  data: Entity<Section>;
}

const LOGINFO = false;

export class DocumentPage extends ConnectedElement {
  logger = new Logger('DocPage');

  @property({ type: String, attribute: 'page-id' })
  pageId: string;

  @property({ type: String, attribute: 'from' })
  fromParentId: string;

  @internalProperty()
  isPagePrivate: boolean;

  @internalProperty()
  lastSharedPageId: string = null;

  @internalProperty()
  addingPage = false;

  @internalProperty()
  fork: ParentAndChild | undefined = undefined;

  @internalProperty()
  pushDiff!: EveesMutation;

  @internalProperty()
  pushing = false;

  @internalProperty()
  eveesPending = false;

  @internalProperty()
  hasPull = false;

  @internalProperty()
  loading = true;

  @internalProperty()
  readOnly = false;

  @query('#doc-editor')
  documentEditor: DocumentEditor;

  @internalProperty()
  showSnackBar = false;

  sections: SectionData[];
  privateSection!: Secured<Perspective>;
  blogSection!: Secured<Perspective>;

  blockUpdates: boolean = false;
  pendingUpdates: boolean = false;

  eveesPull: Evees;
  eveesPush!: Evees;

  originId: string;

  async firstUpdated() {
    if (this.evees.getClient().events) {
      this.evees
        .getClient()
        .events.on(ClientEvents.ecosystemUpdated, (perspectiveIds: string[]) =>
          this.ecosystemUpdated(perspectiveIds)
        );

      this.evees.events.on(EveesEvents.pending, (pending: boolean) => {
        this.eveesPending = pending;
      });
    }

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

  ecosystemUpdated(perspectiveIds: string[]) {
    if (perspectiveIds.includes(this.pageId)) {
      if (LOGINFO) this.logger.log('ecosystemUpdated()');
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
          this.debounceUpdateChanges();
        }
      }, 2500);
    } else {
      if (LOGINFO) this.logger.log('blockUpdates is true');
    }
  }

  async load() {
    this.loading = true;
    this.lastSharedPageId = null;
    this.fork = undefined;
    this.hasPull = false;

    const sectionIds = await this.appManager.getSections();
    this.sections = await Promise.all(
      sectionIds
        .filter((id) => id !== this.fromParentId)
        .map(async (id): Promise<SectionData> => {
          const data = await this.evees.getPerspectiveData(id);
          return {
            id,
            data,
          };
        })
    );

    const { details } = await this.evees.getPerspective(this.pageId);

    this.privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.blogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );

    if (details.guardianId && details.guardianId != this.privateSection.hash) {
      this.isPagePrivate = false;
    } else {
      this.isPagePrivate = true;
    }

    this.readOnly = details.guardianId !== this.privateSection.hash;

    this.loading = false;

    /** check changes is done after loading is set to false to speedup rendering the document */
    const perspective = await this.evees.getEntity(this.pageId);
    if (
      perspective.object.payload.meta &&
      perspective.object.payload.meta.forking
    ) {
      // this page is a fork of another
      this.originId = perspective.object.payload.meta.forking.perspectiveId;
      this.checkOrigin();
    }

    await this.loadForks();
  }

  async loadForks() {
    const forkedIn = await this.appManager.getForkedInMine(this.pageId);
    const otherForks = forkedIn.filter((e) => e.childId !== this.pageId);

    if (otherForks.length > 0) {
      this.fork = otherForks[0];
      await this.loadChanges();
    } else {
      this.fork = undefined;
    }
  }

  async loadChanges() {
    if (LOGINFO) this.logger.log('loadChanges()', { fork: this.fork });
    if (this.fork) {
      this.eveesPush = await this.appManager.compareForks(
        this.fork.childId,
        this.pageId
      );

      this.pushDiff = await this.eveesPush.diff();
      if (LOGINFO)
        this.logger.log('loadChanges() - done', { pushDiff: this.pushDiff });
    } else {
      this.pushDiff = {
        newPerspectives: [],
        updates: [],
        deletedPerspectives: [],
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
    if (this.fork) {
      this.deleteFrom(this.blogSection.hash);
    } else {
      this.shareTo(this.blogSection.hash);
    }
  }

  navToFork() {
    Router.go(GenerateDocumentRoute(this.fork.childId));
  }

  async deleteFrom(sectionId: string) {
    this.addingPage = true;
    const index = await this.evees.getChildIndex(
      this.fork.parentId,
      this.fork.childId
    );
    await this.evees.deleteChild(this.fork.parentId, index);
    await this.evees.flush();
    await this.loadForks();
    this.addingPage = false;
  }

  async shareTo(toSectionId: string) {
    if (LOGINFO) this.logger.log('shareTo', toSectionId);

    if (this.addingPage) return;
    this.addingPage = true;

    const forkId = await this.appManager.createForkOn(this.pageId, toSectionId);
    await this.appManager.clearGetForkedInMine(this.pageId);

    this.lastSharedPageId = forkId;

    this.loadForks();
    this.addingPage = false;
  }

  async pushChanges() {
    if (this.pushing) return;
    this.pushing = true;

    /** flush from onmemory to local */
    await this.eveesPush.flush({
      start: { elements: [{ id: this.fork.childId }] },
    });

    this.pushing = false;
    this.loadForks();
  }

  async checkOrigin() {
    this.eveesPull = await this.appManager.compareForks(
      this.pageId,
      this.originId
    );
    const diff = await this.eveesPull.diff();
    this.hasPull = diff.updates.length > 0;

    // To show the snackbar
    if (this.hasPull) {
      this.showSnackBar = true;
    }
  }

  async pull() {
    await this.eveesPull.flush();
    this.checkOrigin();
    this.documentEditor.reload();
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

  renderTopNav() {
    return html`<div class="app-action-bar">
      ${this.fork !== undefined
        ? html`<uprtcl-button skinny @click=${() => this.navToFork()}
            >View ${this.isPagePrivate ? 'Blog' : 'Private'}
            Version</uprtcl-button
          >`
        : ''}
      <div class="pending">
        ${this.eveesPending ? html`Saving...` : html`Saved`}
      </div>
      <uprtcl-popper>
        <uprtcl-button slot="icon" skinny secondary
          >${`${
            this.fork === undefined
              ? 'Share'
              : `Share${this.nChanges > 0 ? ` (${this.nChanges})` : ''}`
          }`}</uprtcl-button
        >
        ${this.renderShareContent()}
      </uprtcl-popper>
    </div>`;
  }

  renderPrivatePage() {
    return html`<div class="row">
        <div class="column description-column">
          <div class="row">
            <div class="heading">
              ${this.isPagePrivate
                ? this.fork === undefined
                  ? html`Share to blog`
                  : html`Shared to blog`
                : html`Share to Web`}
            </div>
          </div>
          <div class="row">
            <div class="description">
              ${this.isPagePrivate
                ? this.fork === undefined
                  ? html`Sharing to blog creates a public "fork" of this page in
                    your blog`
                  : html`This page is shared in your blog section. Unsharing it
                    will remove and delete it from your blog.`
                : html`Anyone with this link can view this page.`}
            </div>
          </div>
        </div>
        <div class="column center-items">
          ${this.addingPage
            ? html`<uprtcl-loading></uprtcl-loading>`
            : html`<uprtcl-toggle
                @click=${() => this.toggleBlogVersion()}
                ?active=${this.fork !== undefined}
              >
              </uprtcl-toggle>`}
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
              <uprtcl-button skinny @click=${() => this.navToFork()}
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
      <uprtcl-copy-to-clipboard
        text=${GenearateReadURL(
          LTRouter.Router.location.params.docId as string
        )}
      ></uprtcl-copy-to-clipboard> `;
  }

  renderShareContent() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;
    return html`<div class="share-card-cont">
      ${this.isPagePrivate ? this.renderPrivatePage() : this.renderBlogPage()}
      ${this.lastSharedPageId && this.isPagePrivate
        ? html`<uprtcl-copy-to-clipboard
            text=${GenearateReadURL(this.lastSharedPageId)}
          ></uprtcl-copy-to-clipboard>`
        : null}
    </div>`;
  }

  renderSnackBar(type: 'unpushed' | 'pullchanges') {
    const self = this;
    function unpushedChanges() {
      return html`${icons.clear}
        <div>
          You have not pushed, Only pushed content are shared to the blog.
        </div>
        <div class="snackbar-action">Learn more</div>`;
    }

    function pullChanges() {
      return html`
        <div>The origin of this block has been updated</div>
        <div
          class="snackbar-action"
          @click=${() => {
            const resp = confirm('This may overwrite the content of the page.');
            if (resp) {
              self.pull();
              self.showSnackBar = false;
            }
          }}
        >
          Update Now
        </div>
      `;
    }

    return html`<div class="snackbar-cont">
      <div class="snackbar">
        ${(function () {
          switch (type) {
            case 'pullchanges':
              return pullChanges();
            case 'unpushed':
              return unpushedChanges();
          }
        })()}
        <div
          class="snackbar-action"
          @click=${() => {
            this.showSnackBar = false;
          }}
        >
          ${icons.clear}
        </div>
      </div>
    </div>`;
  }

  renderDocument() {
    return html`<documents-editor
      id="doc-editor"
      uref=${this.pageId}
      emit-updates
      ?read-only=${this.readOnly}
      .localEvees=${this.evees}
      .getEveeInfo=${(block) =>
        html`<app-block-info
          uref=${block.uref}
          parentId=${block.parentId}
          show-forks
        ></app-block-info>`}
      .flushConfig=${{
        debounce: 2000,
        autoflush: true,
        levels: 1,
      }}
      show-info
    >
    </documents-editor>`;
  }

  render() {
    return html`
      <div class="page-container">
        ${this.renderTopNav()} ${this.loading ? html`` : this.renderDocument()}
        ${this.hasPull && this.showSnackBar
          ? this.renderSnackBar('pullchanges')
          : null}
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
          overflow-y: auto;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
          padding-bottom: 30vmin;
        }
        #doc-editor {
          max-width: 800px;
          margin: 4vw auto;
        }
        .page-container {
          padding: 0rem 1rem 0rem 4rem;
        }
        .pending {
          --fill: var(--gray-light, black);
          color: var(--gray-light, black);
          font-size: 15px;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-right: 0.5rem;
        }
        .app-action-bar {
          display: flex;
          align-items: center;
          font-weight: 400;
          font-size: 1.1rem;
          padding: 1rem 0rem 1rem 0rem;
        }
        .share-card-cont {
          width: 400px;
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
        .buttons > * {
          --padding: 0px 0rem;
          width: 150px;
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
        .snackbar-cont {
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #262641;
          box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15),
            0px 4px 8px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          animation: slideUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .snackbar-hide {
          animation: slideDown 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes slideUp {
          0% {
            bottom: -5%;
            opacity: 0.3;
          }
          100% {
            bottom: 10%;
            opacity: 1;
          }
        }
        @keyframes slideDown {
          to {
            bottom: 0%;
          }
        }
        .snackbar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-left: 1rem;
          color: #fafcfe;
        }
        .snackbar > * {
          padding: 0.5rem;
        }
        .snackbar-action {
          padding: 0.5rem 1rem;
          border-left: 1px solid #fff6;
          cursor: pointer;
          transition: all 0.2s ease;
          align-items: center;
          justify-content: center;
          display: flex;
          font-weight: bold;
        }
        .snackbar-action:hover {
          background: #fff3;
        }
      `,
    ];
  }
}
