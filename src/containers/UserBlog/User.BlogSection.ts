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
          <div class="topSeperator"></div>
          ${this.blogIds.map((pageId, pageIndex) => {
            return html`
              <app-user-page-blog-section-item
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

        app-user-page-blog-section-item {
          min-height: 150px;
          width: 100%;
          display: block;
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
