import { html, css, internalProperty } from 'lit-element';
import { Router } from '@vaadin/router';
import lodash from 'lodash';
import { EveesHttp } from '@uprtcl/evees-http';
import { styles } from '@uprtcl/common-ui';
import { Entity, Logger, Perspective, Secured } from '@uprtcl/evees';
import { TextNode, TextType } from '@uprtcl/documents';

import LockIcon from '../assets/icons/lock.svg';
import GlobeIcon from '../assets/icons/globe.svg';
import MoreHorizontalIcon from '../assets/icons/more-horizontal.svg';
import { LTRouter } from '../router';
import { ConnectedElement } from '../services/connected.element';
import { GettingStarted } from '../constants/routeNames';

import { Dashboard, PageShareMeta } from './types';
import { sharedStyles } from '../styles';

import CloseIcon from '../assets/icons/x.svg';
import { PermissionType } from '@uprtcl/evees-http';

const MAX_LENGTH = 999;

interface SectionData {
  id: string;
  title: string;
  draggingOver: boolean;
}

type PageOrSection = 'page' | 'section';
export class DashboardElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @query('#share-card-cont')
  shareCardCont;

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  showNewPageDialog = false;

  @internalProperty()
  pageOrSection: PageOrSection;

  @internalProperty()
  selectedPageId: string | undefined;

  @internalProperty()
  selectedPageShareMeta: PageShareMeta = { inPrivate: false, inSections: [] };

  @internalProperty()
  selectedSectionId: string | undefined;

  @internalProperty()
  showShareDialog: boolean;

  dashboardPerspective: Secured<Perspective>;
  dashboardData: Entity<Dashboard>;
  remote: EveesHttp;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', () => this.decodeUrl());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async firstUpdated() {
    this.remote = this.evees.getRemote() as EveesHttp;
    await (this.remote.connection as any).checkLoginCallback();
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      /** check the app scheleton is there */
      await this.appElements.check();
      this.checkBlogPermissions();

      this.dashboardPerspective = await this.appElements.get('/linkedThoughts');

      await this.decodeUrl();
      await this.load();
    } else {
      Router.go(GettingStarted);
    }

    this.loading = false;
  }

  /** init blog ACL to publicRead privateWrite (HTTP-remote-specific) */
  async checkBlogPermissions() {
    const blogSection = await this.appElements.get(
      '/linkedThoughts/blogSection'
    );
    const remote = this.evees.getRemote() as EveesHttp;
    await remote.accessControl.toggleDelegate(blogSection.id, false);
    await remote.accessControl.setPublicPermissions(
      blogSection.id,
      PermissionType.Read,
      true
    );
  }

  async login() {
    await this.remote.login();
    this.isLogged = await this.remote.isLogged();
  }

  async decodeUrl() {
    // /section/private
    // /page/pageId
    // /getting-started
    // /
    // this.sectionSelected = '';
    if (LTRouter.Router.location.params.sectionId) {
      this.pageOrSection = 'section';
      this.selectedSectionId = LTRouter.Router.location.params
        .sectionId as string;
    } else if (LTRouter.Router.location.params.docId) {
      this.pageOrSection = 'page';
      this.selectedPageId = LTRouter.Router.location.params.docId as string;
      await this.loadSelectedPage();
    }
  }

  /** overwrite */
  async load() {
    this.dashboardData = await this.evees.getPerspectiveData<Dashboard>(
      this.dashboardPerspective.id
    );
    await this.loadSections();
  }

  async loadSelectedPage() {
    const privateSection = await this.appElements.get(
      '/linkedThoughts/privateSection'
    );
    const blogSection = await this.appElements.get(
      '/linkedThoughts/blogSection'
    );

    const ixInPrivate = await this.evees.getChildIndex(
      privateSection.id,
      this.selectedPageId
    );
    const ixInBlog = await this.evees.getChildIndex(
      blogSection.id,
      this.selectedPageId
    );

    const inSections = [];
    if (ixInPrivate !== -1) inSections.push(privateSection.id);
    if (ixInBlog !== -1) inSections.push(blogSection.id);

    this.selectedPageShareMeta = {
      inPrivate: ixInPrivate != -1,
      inSections,
    };
  }

  async loadSections() {
    await Promise.all(
      this.dashboardData.object.sections.map(
        async (sectionId): Promise<SectionData> => {
          const sectionData = await this.evees.getPerspectiveData(sectionId);

          if (!sectionData)
            throw new Error(`data not found for section ${sectionId}`);
          const title = this.evees.behavior(sectionData.object, 'title');

          return {
            id: sectionId,
            title,
            draggingOver: false,
          };
        }
      )
    );
  }

  async newPage(onSection: number = 0) {
    const page: TextNode = {
      text: '',
      type: TextType.Title,
      links: [],
    };
    await this.evees.addNewChild(
      page,
      this.dashboardData.object.sections[onSection]
    );

    await this.evees.client.flush();
  }

  async sharePage(pageIndex: number = 0) {
    const privateSection = await this.appElements.get(
      '/linkedThoughts/privateSection'
    );
    const blogSection = await this.appElements.get(
      '/linkedThoughts/blogSection'
    );

    /**
     * Unshare
     * If page is already shared then, on unsharing we need to remove the page from the blog section
     * -> We need to perform the general delete action of the page.
     */

    const privateSectionData = await this.evees.getPerspectiveData(
      privateSection.id
    );
    pageIndex = lodash.findIndex(
      privateSectionData.object.pages,
      (idx) => idx === this.selectedPageId,
      0
    );

    if (
      lodash.includes(this.selectedPageShareMeta.inSections, blogSection.id)
    ) {
      const blogSectionData = await this.evees.getPerspectiveData(
        blogSection.id
      );

      lodash.remove(
        blogSectionData.object.pages,
        (id) => id === this.selectedPageId
      );
      await this.evees.updatePerspectiveData(
        blogSection.id,
        blogSectionData.object
      );
    } else {
      /**
       * Share
       */
      await this.evees.moveChild(
        pageIndex,
        privateSection.id,
        blogSection.id,
        0,
        true,
        false
      );
    }
    await this.loadSelectedPage();
    await this.evees.client.flush();
    setTimeout(() => this.shareCardCont.focus(), 0);
  }

  renderNewPageDialog(showOptions = true) {
    return html`<uprtcl-dialog id="updates-dialog">
      <span
        @click=${() => (this.showNewPageDialog = false)}
        class="new-page-close-icon clickable"
        >${CloseIcon}</span
      >
      <span class="new-page-modal-heading">Add new page to</span>
      <div class="new-page-modal-options">
        <div
          @click=${() => {
            this.showNewPageDialog = false;
            this.newPage(0);
          }}
          class="clickable"
        >
          ${LockIcon} Private
        </div>
        <div
          @click=${() => {
            this.showNewPageDialog = false;
            this.newPage(1);
          }}
          class="clickable"
        >
          ${GlobeIcon} Blog
        </div>
      </div>
    </uprtcl-dialog>`;
  }

  renderHome() {
    return html`<div class="home-title">Now seeing</div>
      <uprtcl-card>
        <evees-perspective-icon
          perspective-id=${this.dashboardPerspective.id}
        ></evees-perspective-icon>
      </uprtcl-card>`;
  }

  renderNavbar() {
    return html`<evees-login-widget showName=${true}></evees-login-widget>
      <div class="row align-center">
        <uprtcl-button
          class="button-new-page"
          @click=${() => {
            this.showNewPageDialog = true;
          }}
        >
          New Page
        </uprtcl-button>
      </div>
      <div class="section-cont">
        ${this.dashboardData.object.sections.map((sectionId, sectionIndex) => {
          return html`<app-nav-section
            uref=${sectionId}
            idx=${sectionIndex}
          ></app-nav-section>`;
        })}
      </div>
      ${this.showNewPageDialog ? this.renderNewPageDialog() : ''}`;
  }

  renderTopNav() {
    // return html``;
    // Need to resolve the page index from the pageID
    // Also this has to be shown only on the private pages

    /**
     * Hence need 2 services / utils
     * -> resolvePageIndexFromPageId(pageId: string): pageIndex: number
     * -> resolveSectionsFromPageId(pageId: number): Array<SectionUref>
     *
     *
     * Possible Cases
     * - Page is only on the private. (Page is sharable, default share state is false)
     * - Page is already shared. (Default share state is true)
     * - Page is only on blog. (No share option)
     * - Sharing functionality shouldn't be there on the blog pages.
     * -
     * PRANSHU, CHECK async loadSelectedPage() in line 118
     */
    const sharedState = !!(this.selectedPageShareMeta.inSections.length >= 2);
    return html`<div class="app-action-bar">
        <div
          class="clickable"
          @click=${() => {
            this.showShareDialog = !this.showShareDialog;
            setTimeout(() => this.shareCardCont.focus(), 0);
          }}
        >
          Share
        </div>
        <div>${MoreHorizontalIcon}</div>
      </div>

      ${this.showShareDialog
        ? html`
            <div
              class="share-card-cont"
              tabindex=${0}
              autofocus
              id="share-card-cont"
              @blur=${() => {
                this.showShareDialog = !this.showShareDialog;
              }}
            >
              <share-card
                .active=${sharedState}
                .onShare=${this.sharePage.bind(this)}
              />
            </div>
          `
        : null} `;
  }

  renderPageContent() {
    return html` ${this.selectedPageId !== undefined
      ? html`
          <div class="page-container">
            ${this.renderTopNav()}
            <documents-editor
              id="doc-editor"
              uref=${this.selectedPageId}
              parent-id=${this.dashboardPerspective.id}
            >
            </documents-editor>
          </div>
        `
      : null}`;
  }
  renderSectionContent() {
    return html` ${this.selectedSectionId !== undefined
      ? html` <app-section-page uref=${this.selectedSectionId} /> `
      : null}`;
  }
  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    this.logger.log('rendering wiki after loading');

    return html`
      <div class="app-content-with-nav">
        <div class="app-navbar">
          ${this.renderNavbar()}
          <div class="padding-div"></div>
          </div>

          <div class="app-content">
            ${
              this.pageOrSection === 'page'
                ? this.renderPageContent()
                : this.pageOrSection === 'section'
                ? this.renderSectionContent()
                : html` <div class="home-container">${this.renderHome()}</div> `
            }
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
        }
        .row {
          display: flex;
          flex-direction: row;
        }
        .align-center {
          justify-content: center;
        }
        .app-content-with-nav {
          flex: 1 1 0;
          display: flex;
          flex-direction: row;
          position: relative;
          overflow: hidden;
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
        .app-action-bar > * {
          margin: 0.75rem 1rem;
        }
        .share-card-cont {
          position: absolute;
          right: 1rem;
          top: 4rem;
          z-index: 3;
        }
        .share-card-cont:focus {
          outline: none;
        }
        .app-navbar {
          scrollbar-width: 0; /* Firefox */
          width: 250px;
          flex-shrink: 0;
          background: var(--white);
          box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
          z-index: 1;
          height: 100%;
          overflow: scroll;
        }
        .app-navbar:hover {
          overflow: scroll;
        }
        .app-navbar::-webkit-scrollbar {
          display: none;
        }
        .app-navbar:hover::-webkit-scrollbar {
          width: 8px;
          display: block;
          scrollbar-width: 8px; /* Firefox */
        }
        .app-navbar::-webkit-scrollbar-track {
          /* box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3); */
        }

        .app-navbar::-webkit-scrollbar-thumb {
          background-color: var(--black-transparent, #0003);
          border-radius: 1rem;
        }
        .padding-div {
          height: 10%;
          max-height: 5rem;
        }

        .section-cont {
          /* margin-left:2rem; */
        }
        .app-content {
          background: var(--background-color);
          min-width: 475px;
          max-width: calc(100% - 260px - 1px);
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          max-height: 100vh;
        }
        .empty-pages-loader {
          margin-top: 22px;
          display: block;
        }
        .page-item-row {
          position: relative;
        }
        .page-item {
          min-height: 48px;
          cursor: pointer;
          width: calc(100% - 19px);
          display: flex;
          padding: 0px 3px 0px 16px;
          transition: all 0.1s ease-in;
        }
        .page-item .text-container {
          white-space: nowrap;
          overflow: hidden;
          max-width: calc(100% - 48px);
          overflow-x: hidden;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .page-item .item-menu-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .page-item .item-menu-container .options-menu {
          --box-width: 160px;
          font-weight: normal;
        }
        .page-item:hover {
          background-color: #e8ecec;
        }
        .title-empty {
          color: #a2a8aa;
          font-style: italic;
        }
        .title-selected {
          font-weight: bold;
          background-color: rgb(200, 200, 200, 0.2);
        }
        .title-dragging-over {
          position: absolute;
          bottom: -1px;
          height: 2px;
          background-color: #2196f3;
          width: 100%;
        }
        .empty {
          width: 100%;
          text-align: center;
          padding-top: 24px;
          color: #a2a8aa;
        }
        .button-new-page {
          height: 40px;
          width: '100%';
          max-width: 170px;
        }
        .button-row {
          width: calc(100% - 20px);
          padding: 16px 10px 8px 10px;
          display: flex;
        }
        .button-row uprtcl-button-loading {
          margin: 0 auto;
          /* width: 180px; */
        }
        .page-container {
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

        .page-container::-webkit-scrollbar {
          display: none;
        }

        .home-container {
          margin: 0 auto;
          max-width: 900px;
          width: 100%;
          text-align: center;
          height: auto;
          padding: 6vw 0vw;
        }
        .home-container .home-title {
          font-size: 22px;
          font-weight: bold;
        }
        .home-container uprtcl-card {
          display: block;
          width: 340px;
          margin: 16px auto;
          padding: 12px 16px;
        }
        .new-page-modal-heading {
          font-size: 1.75rem;
          font-weight: 600;
          text-align: center;
          margin: 1rem 0rem;
        }
        .new-page-close-icon {
          position: absolute;
          right: 1rem;
        }
        .new-page-modal-options {
          width: 100%;
          text-align: center;
          display: flex;
          flex-wrap: wrap;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
          justify-content: center;
        }
        .new-page-modal-options > * {
          margin: 0 1rem;
          /* flex: 1; */
          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 158px;
          justify-content: center;
          flex-basis: 40%;
        }
        .new-page-modal-options img {
          margin-bottom: 1rem;
        }
      `,
    ];
  }
}
