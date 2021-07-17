import {
  LitElement,
  html,
  query,
  css,
  TemplateResult,
  internalProperty,
} from 'lit-element';

import { EveesHttp } from '@uprtcl/evees-http';

import { LTRouter } from './router/router';
import { sharedStyles } from './styles';
import { RouteLocation, RouteName, RouteParams } from './router/routes.types';
import { ConnectedElement } from './services/connected.element';
import { Section } from './containers/types';
import { Router } from '@vaadin/router';
import {
  GenerateDocumentRoute,
  GenerateSectionRoute,
  GenerateUserDocRoute,
  GenerateUserRoute,
} from './router/routes.builder';
import { GetLastVisited } from './utils/localStorage';

export class App extends ConnectedElement {
  @query('#outlet')
  outlet: HTMLElement;

  @internalProperty()
  component!: TemplateResult;

  @internalProperty()
  location!: RouteLocation;

  @internalProperty()
  isLogged = false;

  remote: EveesHttp;

  async firstUpdated() {
    LTRouter.setupRouter(this.outlet);

    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();

    this.checkLastVisited();

    window.addEventListener('popstate', () => this.decodeUrl());
  }

  async decodeUrl() {
    this.location = {
      name: LTRouter.Router.location.route.name as RouteName,
      params: {
        ...LTRouter.Router.location.params,
      },
    };

    if (this.location.name === RouteName.dashboard) {
      // go to the first private page if nothing is selected.
      if (this.isLogged) {
        const privateSection = await this.appManager.elements.get(
          '/linkedThoughts/privateSection'
        );
        const privateSectionData = await this.evees.getPerspectiveData<Section>(
          privateSection.hash
        );

        if (privateSectionData && privateSectionData.object.pages.length > 0) {
          this.goToRoute(RouteName.dashboard_page, {
            pageId: privateSectionData.object.pages[0],
          });
        }
      }
    }
  }

  goToRoute(name: RouteName, params: RouteParams) {
    let url: string;
    ('');

    switch (name) {
      case RouteName.dashboard:
        url = '/';
        break;

      case RouteName.dashboard_page:
        url = GenerateDocumentRoute(params.pageId);
        break;

      case RouteName.dashboard_section:
        url = GenerateSectionRoute(params.sectionId);
        break;

      case RouteName.user_blog:
        url = GenerateUserRoute(params.userId);
        break;

      case RouteName.user_blog_page:
        url = GenerateUserDocRoute(params.userId, params.pageId);
        break;
    }

    Router.go(url);
  }

  reloadComponent() {
    switch (this.location.name) {
      case RouteName.dashboard:
      case RouteName.dashboard_page:
      case RouteName.dashboard_section:
        this.component = html`<app-dashboard></app-dashboard>`;
    }
  }

  async checkLastVisited() {
    const lastVisited = GetLastVisited();

    if (lastVisited) {
      if (lastVisited.type === RouteName.dashboard_page) {
        this.goToRoute(RouteName.dashboard_page, { pageId: lastVisited.id });
      }
      if (lastVisited.type === RouteName.dashboard_section) {
        this.goToRoute(RouteName.dashboard_section, { pageId: lastVisited.id });
      }
    }
  }

  render() {
    return html`<div id="outlet"></div>
      ${this.component}`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          height: 100%;
          flex-direction: column;
          display: flex;
          justify-content: center;
          --primary: #4260f6;
          --secondary: #333333;
          --secondary-live: #efeffd;
          --secondary-live-color: #4260f6;
          --white: #ffffff;
          --black: #000000;
          --black-transparent: rgba(3, 3, 3, 0.25);
          --gray-dark: #333333;
          --gray-light: #828282;
          --gray-hover: #c4c4c478;
          --border-radius-complete: 0.5rem;
          --background-color: #fffffb;
        }

        #outlet {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
      `,
    ];
  }
}
