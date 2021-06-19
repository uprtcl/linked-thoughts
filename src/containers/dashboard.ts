import { html, css, internalProperty, query } from 'lit-element';
import { Router } from '@vaadin/router';
import { EveesHttp } from '@uprtcl/evees-http';
import { icons, styles } from '@uprtcl/common-ui';
import { Entity, Logger, Perspective, Secured } from '@uprtcl/evees';

import { LTRouter } from '../router';
import { ConnectedElement } from '../services/connected.element';
import { GettingStarted } from '../constants/routeNames';

import { Dashboard, Section } from './types';
import { sharedStyles } from '../styles';
import { DeleteLastVisited, GetLastVisited } from '../utils/localStorage';
import {
  GenerateDocumentRoute,
  GenerateSectionRoute,
  GenerateForksRoute,
  RouteName,
  NavigateTo404,
} from '../utils/routes.helpers';

export class DashboardElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  routeName: RouteName;

  @internalProperty()
  selectedPageId: string | undefined;

  @internalProperty()
  selectedSectionId: string | undefined;

  dashboardPerspective: Secured<Perspective>;
  forksSection: Secured<Perspective>;

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
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      await this.appManager.init();

      this.dashboardPerspective = await this.appManager.elements.get(
        '/linkedThoughts'
      );

      this.forksSection = await this.appManager.elements.get(
        '/linkedThoughts/forksSection'
      );

      await this.decodeUrl();

      this.checkLastVisited();

      await this.load();
    } else {
      Router.go(GettingStarted);
    }
  }

  async login() {
    await this.remote.login();
    this.isLogged = await this.remote.isLogged();
  }

  async loggedUserChanged() {
    DeleteLastVisited();
    await this.firstUpdated();
  }

  async decodeUrl() {
    // /section/private
    // /page/pageId
    // /getting-started

    this.routeName = LTRouter.Router.location.route.name as RouteName;
    const routeParams = LTRouter.Router.location.params as any;

    if (this.routeName === RouteName.section) {
      this.selectedSectionId = routeParams.sectionId;
    } else if (this.routeName === RouteName.page) {
      this.selectedPageId = routeParams.docId;
      try {
        const PageExist = await this.evees.getPerspectiveData(
          this.selectedPageId
        );
      } catch (e) {
        this.appManager.appError.clearLastVisited();
        NavigateTo404();
      }
    } else if (this.routeName === RouteName.dashboard) {
      // go to the first private page if nothing is selected.
      if (this.isLogged) {
        const privateSection = await this.appManager.elements.get(
          '/linkedThoughts/privateSection'
        );
        const privateSectionData = await this.evees.getPerspectiveData<Section>(
          privateSection.hash
        );

        if (privateSectionData && privateSectionData.object.pages.length > 0) {
          Router.go(GenerateDocumentRoute(privateSectionData.object.pages[0]));
        }
      }
    }
  }

  async checkLastVisited() {
    const lastVisited = GetLastVisited();

    if (lastVisited) {
      if (lastVisited.type === RouteName.page) {
        Router.go(GenerateDocumentRoute(lastVisited.id));
      }
      if (lastVisited.type === RouteName.section) {
        Router.go(GenerateSectionRoute(lastVisited.id));
      }
    }
  }

  /** overwrite */
  async load() {
    this.loading = true;
    this.dashboardData = await this.evees.getPerspectiveData<Dashboard>(
      this.dashboardPerspective.hash
    );
    if (!this.dashboardData) {
      throw new Error('dashboard data not defined');
    }
    this.loading = false;
  }

  async newPage(onSection: number = 0) {
    const pageId = await this.appManager.newPage(
      this.dashboardData.object.sections[onSection]
    );
    Router.go(GenerateDocumentRoute(pageId));
  }

  renderHome() {
    return html``;
  }

  renderNavbar() {
    if (!this.dashboardData) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`<div class="user-container">
        <evees-login-widget
          slot="icon"
          @changed=${() => this.loggedUserChanged()}
        ></evees-login-widget>
      </div>
      <div class="column align-center actions-container">
        <uprtcl-button class="button-new-page" @click=${() => this.newPage()}>
          New Page
        </uprtcl-button>
        <br />
        <!-- <div class="actions-item clickable">
          ${icons.clock} <span class="actions-label">Recents</span>
        </div>
        <div
          class="actions-item clickable"
          @click=${() => Router.go(GenerateForksRoute())}
        >
          ${icons.fork} <span class="actions-label">Forks</span>
        </div> -->
      </div>

      <div class="section-cont">
        <app-nav-section
          uref=${this.dashboardData.object.sections[0]}
          idx=${0}
        ></app-nav-section>
        <app-nav-section
          uref=${this.dashboardData.object.sections[1]}
          idx=${1}
        ></app-nav-section>
        <app-nav-section
          uref=${this.dashboardData.object.sections[2]}
          idx=${2}
        ></app-nav-section>
      </div> `;
  }

  renderForkContent() {
    const actionOptions = new Map();
    actionOptions.set('remove', { text: 'Remove' });
    actionOptions.set('copyToClipboard', { text: 'Add to Clipboard' });

    return html`<app-evees-data-collection
      title="Forks"
      uref=${this.forksSection.hash}
      .actionOptions=${actionOptions}
    />`;
  }

  renderSectionContent() {}

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <div class="app-content-with-nav">
        <div class="app-navbar">
          ${this.renderNavbar()}
          <div class="padding-div"></div>
          </div>

          <div class="app-content">
            ${
              this.routeName === RouteName.page
                ? html`<app-document-page page-id=${this.selectedPageId} />`
                : this.routeName === RouteName.section
                ? html`<app-section-page
                    uref=${this.selectedSectionId}
                  ></app-section-page>`
                : this.routeName === RouteName.fork
                ? this.renderForkContent()
                : html` <div class="home-container">${this.renderHome()}</div> `
            }
          </div>
        </div>
      </div>
      <app-explore-section></app-explore-section>
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
          justify-content: center;
        }
        app-explore-section {
          position: absolute;
          right: 0;
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

        .actions-container {
          width: max-content;
          align-self: center;
        }
        .actions-item {
          margin: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: start;
          color: #5c5c77;
        }
        .actions-label {
          margin-left: 0.6rem;
          font-size: 1.1rem;
        }
        .app-navbar {
          scrollbar-width: 0; /* Firefox */
          width: 250px;
          flex-shrink: 0;
          background: var(--white);
          box-shadow: 1px 0px 10px rgba(0, 0, 0, 0.1);
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .app-navbar::-webkit-scrollbar {
          display: none;
        }
        .user-container {
          padding: 1rem;
          flex: 0 0 auto;
        }
        .row {
          flex: 0 0 auto;
        }

        .padding-div {
          height: 10%;
          max-height: 5rem;
        }

        .section-cont {
          overflow: auto;
          flex: 1 0 auto;
        }
        .app-content {
          background: var(--background-color);
          min-width: 475px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          max-height: 100vh;
          padding: 3rem 2rem 0 2.5rem;
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
      `,
    ];
  }
}
