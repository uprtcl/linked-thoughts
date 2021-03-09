import { UprtclTextField } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import {
  BeforeLeaveObserver,
  PreventCommands,
  Router,
  RouterLocation,
} from '@vaadin/router';
import { html, css, property, internalProperty, query } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LTRouter } from '../../router';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import LTIntersectionObserver from '../IntersectionObserver/IntersectionObserver';
import { NavigateTo404 } from '../../utils/routes.helpers';
import { GenerateUserRoute } from '../../utils/routes.helpers';
import CloseIcon from '../../assets/icons/close-purple.svg';
export default class ReadOnlyPage
  extends ConnectedElement
  implements BeforeLeaveObserver {
  @internalProperty()
  blogFeedIds: string[] = [];

  @internalProperty()
  userBlogId: string = null;

  @query('#user-id-input')
  userIdElement: UprtclTextField;
  @property()
  uref: string;

  @property()
  containerType: 'mobile' | 'desktop' = 'desktop';

  @internalProperty()
  selectedBlogId: string = null;

  loading: boolean = false;

  userId: string;

  onBeforeLeave(
    location: RouterLocation,
    commands: PreventCommands,
    router: Router
  ) {
    const URLDocId = location.params.docId as string;
    if (URLDocId) {
      this.selectedBlogId = URLDocId;
    } else {
      this.selectedBlogId = null;
    }

    return commands.prevent();

    // ...
  }
  @query('#intersection-observer')
  intersectionObserverEl!: LTIntersectionObserver;

  async firstUpdated() {
    await this.load();
  }

  async getUserBlogId(userId) {
    this.userBlogId = await this.appManager.getBlogIdOf(userId);

    if (!this.userBlogId) {
      NavigateTo404();
    }
  }

  async load() {
    const routeParams = LTRouter.Router.location.params as any;
    if (routeParams.userId) {
      this.userId = routeParams.userId;
      this.getUserBlogId(routeParams.userId);
    }

    const URLDocId = LTRouter.Router.location.params.docId as string;
    if (URLDocId) {
      this.selectedBlogId = URLDocId;
    }

    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
  }

  render() {
    if (this.loading) return html``;

    return html`<div class="root">
      <div class=${`docReadCont ${!this.selectedBlogId ? 'hide' : ''}`}>
        <div
          class="closeButton clickable"
          @click=${() => {
            this.selectedBlogId = null;
            window.history.replaceState({}, '', GenerateUserRoute(this.userId));
          }}
          Router.go(GenerateUserRoute(this.userId));
        >
          ${CloseIcon}
        </div>
        <documents-editor
          class="docRead"
          uref=${this.selectedBlogId}
          ?read-only=${true}
        >
        </documents-editor>
      </div>

      <app-appbar-public></app-appbar-public>
      ${this.userBlogId
        ? html` <app-user-page-blog-section
         .onSelection=${(uref) => (this.selectedBlogId = uref)}
            userId=${this.userId}
            uref=${this.userBlogId}
          />`
        : null}
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          font-family: 'Inter';
        }
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

        .docReadCont {
          background: rgba(255, 255, 255, 0.8);
          box-shadow: -2px 0px 100px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(6rem);
          animation: zoomIn 0.2s ease-in-out;
          align-self: center;
          border-radius: 10px 3px 3px 10px;
          position: fixed;
          overflow-y: scroll;
          z-index: 5;
          width: 100%;
          height: 100%;
          overscroll-behavior: contain;
          display: flex;
          flex-direction: column;
        }
        .docReadCont::-webkit-scrollbar-thumb {
          background-color: #0003;
          border-radius: 1rem;
        }
        .docReadCont::-webkit-scrollbar {
          width: 8px;
          display: block;
          scrollbar-width: 8px; /* Firefox */
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
