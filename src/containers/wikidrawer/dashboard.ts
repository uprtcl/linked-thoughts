import { html, css, internalProperty, LitElement } from 'lit-element';
import { Router } from '@vaadin/router';

import { EveesHttp } from '@uprtcl/evees-http';
import { styles } from '@uprtcl/common-ui';
import {
  Entity,
  eveesConnect,
  Logger,
  Perspective,
  Secured,
} from '@uprtcl/evees';

import LockIcon from '../../assets/icons/lock.svg';
import GlobeIcon from '../../assets/icons/globe.svg';
import { AppSupport } from './support';
import { Dashboard } from './types';

import { GettingStarted } from '../../constants/routeNames';

const MAX_LENGTH = 999;

interface SectionData {
  id: string;
  title: string;
  draggingOver: boolean;
}

export class DashboardElement extends eveesConnect(LitElement) {
  logger = new Logger('Dashboard');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  showNewPageDialog = false;

  @internalProperty()
  selectedPageId: string | undefined;

  homePerspective: Secured<Perspective>;
  dashboardId: string;
  dashboardData: Entity<Dashboard>;
  remote: EveesHttp;

  async firstUpdated() {
    this.remote = (await AppSupport.getRemote(this.evees)) as EveesHttp;
    await (this.remote.connection as any).checkLoginCallback();
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      this.homePerspective = await this.evees.getHome(this.remote.id);

      this.decodeUrl();
      await this.checkDashboardInit();
      await this.load();
    } else {
      Router.go(GettingStarted);
    }

    this.loading = false;
  }

  async login() {
    await this.remote.login();
    this.isLogged = await this.remote.isLogged();
  }

  decodeUrl() {
    // /section/private
    // /page/pageId
    // /getting-started
    // /
    // this.sectionSelected = '';
    // this.pageSelected = '';
  }

  async checkDashboardInit() {
    const { details } = await this.evees.client.getPerspective(
      this.homePerspective.id
    );

    /** canUpdate is used as the flag to detect if the home space exists */
    if (!details.canUpdate) {
      /** create the home perspective as it did not existed */
      const id = await this.evees.createEvee({
        partialPerspective: this.homePerspective.object.payload,
      });

      if (id !== this.homePerspective.id) {
        throw new Error('Undexpected id for home perspective');
      }

      await AppSupport.InitWorkspace(this.evees, this.homePerspective.id);
    }
  }

  /** overwrite */
  async load() {
    this.loading = true;
    const homeData = await this.evees.getPerspectiveData(
      this.homePerspective.id
    );
    this.dashboardId = homeData.object.linkedThoughts;
    this.dashboardData = await this.evees.getPerspectiveData<Dashboard>(
      this.dashboardId
    );
    await this.loadSections();
    this.loading = true;
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
    // const page: TextNode = {
    //   text: '',
    //   type: TextType.Title,
    //   links: [],
    // };
    // const pageId = await this.evees.createEvee({
    //   object: page,
    //   parentId: this.dashboardData.object.sections[onSection],
    // });
  }

  renderNewPageDialog(showOptions = true) {
    return html`<uprtcl-dialog id="updates-dialog">
      <span class="new-page-modal-heading">Add new page to</span>
      <div class="new-page-modal-options">
        <div>
          <img src=${LockIcon} />
          Private
        </div>
        <div>
          <img src=${GlobeIcon} />
          Blog
        </div>
      </div>
      <button @click=${() => (this.showNewPageDialog = false)}>Close</button>
      <button
        @click=${() => {
          this.showNewPageDialog = false;
          this.newPage();
        }}
      >
        Create New Page
      </button>
    </uprtcl-dialog>`;
  }

  renderHome() {
    return html`<div class="home-title">Now seeing</div>
      <uprtcl-card>
        <evees-perspective-icon
          perspective-id=${this.dashboardId}
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
      ${this.dashboardData.object.sections.map((sectionId) => {
        return html`<app-section uref=${sectionId}></app-section>`;
      })}
      ${this.showNewPageDialog ? this.renderNewPageDialog() : ''}`;
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    this.logger.log('rendering wiki after loading');

    return html`
      <div class="app-content-with-nav">
        <div class="app-navbar">${this.renderNavbar()}</div>

        <div class="app-content">
          ${this.selectedPageId !== undefined
            ? html`
                <div class="page-container">
                  <documents-editor
                    id="doc-editor"
                    uref=${this.selectedPageId}
                    parent-id=${this.dashboardId}
                  >
                  </documents-editor>
                </div>
              `
            : html` <div class="home-container">${this.renderHome()}</div> `}
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      styles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
        }
        .app-content-with-nav {
          flex: 1 1 0;
          display: flex;
          flex-direction: row;
          position: relative;
          overflow: hidden;
        }
        .app-navbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
          width: 260px;
          flex-shrink: 0;
          background: var(--white);
          box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
          z-index: 1;
          height: 100%;
          overflow: scroll;
        }
        .app-navbar::-webkit-scrollbar {
          display: none;
        }

        .app-content {
          background: var(--background-color);
          min-width: 475px;
          max-width: calc(100% - 260px - 1px);
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          position: relative;
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
        .new-page-modal-options {
          width: 100%;
          text-align: center;
          display: flex;
          flex-wrap: wrap;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
        }
        .new-page-modal-options > * {
          margin: 0 1rem;
          flex: 1;
          box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 128px;
          justify-content: center;
        }
        .new-page-modal-options img {
          margin-bottom: 1rem;
        }
      `,
    ];
  }
}
