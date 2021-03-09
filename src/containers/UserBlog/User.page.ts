import { UprtclTextField } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import { Router } from '@vaadin/router';
import { html, css, property, internalProperty, query } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LTRouter } from '../../router';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import LTIntersectionObserver from '../IntersectionObserver/IntersectionObserver';
import { NavigateTo404 } from '../../utils/routes.helpers';
import { GenerateUserRoute } from '../../utils/routes.helpers';

export default class ReadOnlyPage extends ConnectedElement {
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
            Router.go(GenerateUserRoute(this.userId));
          }}
        >
          <-
        </div>
        <documents-editor uref=${this.selectedBlogId} ?read-only=${true}>
        </documents-editor>
      </div>

        <app-appbar-public></app-appbar-public>
      ${this.userBlogId
        ? html` <app-user-page-blog-section
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
          backdrop-filter: blur(1rem);
          animation: zoomIn 0.2s ease-in-out;
          /* Note: backdrop-filter has minimal browser support */
          align-self: center;
          border-radius: 10px 3px 3px 10px;
          position: sticky;
          /* width: 100%; */
          top: 0;
          overflow-y: scroll;
          z-index: 5;
          height: 85vh;
          /* top: 5vh; */
          width: 100%;
          padding: 2rem 0;
          overscroll-behavior: contain;
          border-bottom: 2px solid #f0f;
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
        .closeButton {
          position: absolute;
          left: 0.5rem;
          top: 0.5rem;
          font-size: 1.5rem;
          color: #4260f6;
          background: #efeffd;
          padding: 0.25rem 0.5rem;
          border-radius: 2rem;
        }
        .hide {
          display: none;
        }
        .hideVisibility {
          opacity: 0.5;
        }
      `,
    ];
  }
}
