import { UprtclTextField } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import { Router } from '@vaadin/router';
import { html, css, property, internalProperty, query } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { LTRouter } from '../../router';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import LTIntersectionObserver from '../IntersectionObserver/IntersectionObserver';

export default class ReadOnlyPage extends ConnectedElement {
  // ------------------------------------------
  // SAMPLE CODE FOR PRANSHU --- TO BE REMOVED
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
      Router.go('/404');
    }
  }

  
  async load() {
    const routeParams = LTRouter.Router.location.params as any;
    if (routeParams.userId) {
      this.userId = routeParams.userId;
      this.getUserBlogId(routeParams.userId);
    }
    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
  }

  render() {
    if (this.loading) return html``;

    // return html` <div class="root">Hello</div>`;
    return html`<div class="root">
      <app-appbar-public></app-appbar-public>
      <div class="content">
        ${this.userBlogId
          ? html` <app-user-page-blog-section
              userId=${this.userId}
              uref=${this.userBlogId}
            />`
          : null}
      </div>
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
        }
        .content {
          margin-top: 5vh;
        }
      `,
    ];
  }
}
