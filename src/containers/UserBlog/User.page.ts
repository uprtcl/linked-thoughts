import { html, css, property, internalProperty, query } from 'lit-element';

import { UprtclTextField } from '@uprtcl/common-ui';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import LTIntersectionObserver from '../IntersectionObserver/IntersectionObserver';
import { RouteName, RouterGoEvent } from '../../router/routes.types';

import { PAGE_SELECTED_EVENT_NAME } from '../Collections/Items/page-feed.Item';
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

    this.addEventListener(PAGE_SELECTED_EVENT_NAME, ((event: CustomEvent) => {
      event.stopPropagation();
      this.showSelectedBlogPost(event.detail.uref);
    }) as EventListener);
  }

  async load() {
    this.logger.log('load()');
    this.userBlogId = await this.appManager.getBlogIdOf(this.userId);
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
    this.dispatchEvent(
      new RouterGoEvent({
        name: RouteName.user_blog_page,
        params: { userId: this.userId, pageId: uref },
      })
    );
  }

  closeSelectedBlogPost() {
    this.logger.log('closeSelectedBlogPost()');
    this.selectedBlogId = undefined;
    this.dispatchEvent(
      new RouterGoEvent({
        name: RouteName.user_blog,
        params: { userId: this.userId },
      })
    );
  }

  render() {
    this.logger.log('render()');

    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

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

      <div class="feed-container">
        <app-user-page-blog-section
          userId=${this.userId}
          uref=${this.userBlogId}
      ></app-user-page-blog-section>
      </div>
      }
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        .feed-container {
          /* should be the same as Appbar.public */
          padding: 0 7vw;
        }
        .docRead {
          flex: 1;
          padding-top: 1rem;
        }
      `,
    ];
  }
}
