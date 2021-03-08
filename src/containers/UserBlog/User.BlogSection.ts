import { html, css, internalProperty, property, query } from 'lit-element';
import { EveesBaseElement, Logger } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { sharedStyles } from '../../styles';
import { APP_MANAGER } from '../../services/init';
import { AppManager } from '../../services/app.manager';

import { Section } from '../types';
import UprtclIsVisible from '../IntersectionObserver/IntersectionObserver';
import { LTRouter } from '../../router';
import { Router } from '@vaadin/router';
import { GenerateUserRoute } from '../../utils/routes.helpers';
export default class UserPublicBlogSection extends EveesBaseElement<Section> {
  logger = new Logger('UserPublicBlogSection');

  @property({ type: String })
  uref: string;

  @property({ type: String })
  userId: string;

  @internalProperty()
  blogIds: string[] = [];

  @internalProperty()
  isEnded: boolean = false;

  @internalProperty()
  selectedBlogId: string = null;

  // TODO request app mananger on an ConnectedEveeElement base class...
  appManager: AppManager;

  @query('#is-visible')
  isVisibleEl!: UprtclIsVisible;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }

  async firstUpdated() {
    await super.firstUpdated();

    const URLDocId = LTRouter.Router.location.params.docId as string;
    if (URLDocId) {
      this.selectedBlogId = URLDocId;
    }
    this.getMoreFeed(3);
  }

  intersectDetected({ detail }) {
    console.log('intersectDetected', detail);
    if (detail.isIntersecting) {
      this.getMoreFeed();
    }
  }

  async getMoreFeed(first: number = 1) {
    if (this.isEnded) return;

    this.logger.log('getMoreFeed()');

    if (this.isVisibleEl) {
      this.logger.log('disable()');
      this.isVisibleEl.enable = false;
      await this.isVisibleEl.updateComplete;
    }

    const newNumberOfEls =
      this.data.object.pages.length > this.blogIds.length + first
        ? this.blogIds.length + first
        : this.data.object.pages.length;

    if (newNumberOfEls === this.data.object.pages.length) {
      this.isEnded = true;
    }

    const newIds = this.data.object.pages.slice(0, newNumberOfEls);

    /** a single assignment that triggers re-render */
    this.blogIds = newIds;

    await this.updateComplete;

    if (this.isVisibleEl) {
      this.logger.log('enable()');
      this.isVisibleEl.enable = true;

      await this.isVisibleEl.updateComplete;

      if (this.isVisibleEl.isShown && !this.isEnded) {
        this.logger.log('is still visible!');
        await this.getMoreFeed();
      }
    }
  }
  visibleChanged(value: boolean) {
    if (value) {
      this.getMoreFeed();
    }
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`<div>
      <div class="cont">
        <div class="profileCont">
          <div class="author">
            <evees-author
              remote-id=${this.evees.findRemote('http').id}
              user-id=${this.userId}
              show-name
            ></evees-author>
          </div>
        </div>
        <div class="blogsCont">
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
          <div class=${`${this.selectedBlogId ? 'hideVisibility' : ''}`}>
            <div class="topSeperator"></div>
            ${this.blogIds.map((pageId, pageIndex) => {
              return html`
                <app-user-page-blog-section-item
                  .onSelection=${(uref) => (this.selectedBlogId = uref)}
                  uref=${pageId}
                  userId=${this.userId}
                ></app-user-page-blog-section-item>
              `;
            })}
            <app-intersection-observer
              id="is-visible"
              @visible-changed="${(e) => this.visibleChanged(e.detail.value)}"
            >
            </app-intersection-observer>
          </div>
        </div>
      </div>
    </div>`;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
        }
        .cont {
          display: flex;
        }
        .profileCont {
          flex: 1;
          justify-content: center;
          display: flex;
        }
        .author {
          margin-top: 5%;

          width: 80%;

          overflow: hidden;
        }

        .blogsCont {
          flex: 4;
          position: relative;
        }
        .topSeperator {
          height: 5vh;
        }
        .hide {
          display: none;
        }
        .hideVisibility {
          opacity: 0.5;
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
          top: 5vh;
          width: 100%;
          padding: 2rem 0;
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
        app-user-page-blog-section-item {
          min-height: 150px;
          width: 100%;
          display: block;
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

        @media only screen and (max-width: 720px) {
          .cont {
            flex-direction: column;
          }
        }
      `,
    ];
  }
}
