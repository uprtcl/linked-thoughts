import {
  BeforeLeaveObserver,
  PreventCommands,
  Router,
  RouterLocation,
} from '@vaadin/router';
import { html, css, property, internalProperty, query } from 'lit-element';

import { UprtclTextField } from '@uprtcl/common-ui';

import { LTRouter } from '../../router';
import { GenearateUserDocReadURL } from '../../utils/routes.generator';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import LTIntersectionObserver from '../IntersectionObserver/IntersectionObserver';
import { NavigateTo404 } from '../../utils/routes.helpers';
import { GenerateUserRoute } from '../../utils/routes.helpers';

import { PAGE_SELECTED_EVENT_NAME } from './User.BlogSection.Item';
import { Logger } from '@uprtcl/evees';
export default class ReadOnlyPage extends ConnectedElement {
  logger = new Logger('ReadOnlyPage');

  @internalProperty()
  blogFeedIds: string[] = [];

  @internalProperty()
  userBlogId: string = null;

  @property()
  containerType: 'mobile' | 'desktop' = 'desktop';

  @internalProperty()
  selectedBlogId: string | undefined = undefined;

  @internalProperty()
  loading: boolean = true;

  @query('#user-id-input')
  userIdElement: UprtclTextField;

  @internalProperty()
  userId: string;

  @query('#intersection-observer')
  intersectionObserverEl!: LTIntersectionObserver;

  async firstUpdated() {
    this.logger.log('firstUpdated()');
    await this.load();
    this.loading = false;
  }

  connectedCallback() {
    this.logger.log('connectedCallback()');
    super.connectedCallback();

    window.addEventListener('popstate', () => this.decodeUrl());

    this.addEventListener(PAGE_SELECTED_EVENT_NAME, ((event: CustomEvent) => {
      event.stopPropagation();
      this.showSelectedBlogPost(event.detail.uref);
    }) as EventListener);
  }

  async getUserBlogId(userId) {
    this.userBlogId = await this.appManager.getBlogIdOf(userId);

    if (!this.userBlogId) {
      NavigateTo404();
    }
  }

  async load() {
    this.logger.log('load()');
    await this.decodeUrl();
  }

  async decodeUrl() {
    this.logger.log('decodeUrl()');

    const routeParams = LTRouter.Router.location.params as any;
    if (routeParams.userId) {
      this.userId = routeParams.userId;
    }

    const URLDocId = LTRouter.Router.location.params.docId as string;
    if (URLDocId) {
      this.selectedBlogId = URLDocId;
    }

    await this.getUserBlogId(routeParams.userId);
  }

  updated(cp) {
    this.logger.log('updated()');
    if (cp.has('selectedBlogId')) {
      this.logger.log({
        selectedBlogId: this.selectedBlogId,
        oldSelectedBlogId: cp.get('selectedBlogId'),
      });
    }
  }

  showSelectedBlogPost(uref: string) {
    this.logger.log('showSelectedBlogPost()', uref);
    Router.go(GenearateUserDocReadURL(this.userId, uref));
  }

  closeSelectedBlogPost() {
    this.logger.log('closeSelectedBlogPost()');
    this.selectedBlogId = undefined;
    Router.go(GenerateUserRoute(this.userId));
  }

  render() {
    this.logger.log('render()');

    if (this.loading) return html`loading`;

    return html`

      ${
        this.selectedBlogId
          ? html`<uprtcl-dialog
              show-close
              size="large"
              @close=${() => this.closeSelectedBlogPost()}
              ><documents-editor
                class="docRead"
                uref=${this.selectedBlogId}
                ?read-only=${true}
                .getEveeInfo=${(uref) =>
                  html`<app-block-info uref=${uref}></app-block-info>`}
                show-info
              >
              </documents-editor
            ></uprtcl-dialog>`
          : ''
      }

      <app-appbar-public></app-appbar-public>

      ${
        this.userBlogId
          ? html` <app-user-page-blog-section
              userId=${this.userId}
              uref=${this.userBlogId}
            />`
          : null
      }
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .root {
          height: 100vh;
          width: 100vw;
          overflow-x: hidden;
        }
        .root::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .root {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        .docRead {
          flex: 1;
          padding-top: 1rem;
        }
        .closeButton {
          z-index: inherit;
          position: sticky;
          left: 0.5rem;
          top: 0;
          background: rgb(255, 255, 255);
          padding: 0.5rem;
        }
        .hide {
          display: none;
        }
        .hideVisibility {
          opacity: 0.5;
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.1);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `,
    ];
  }
}
