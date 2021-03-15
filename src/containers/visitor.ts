import { html, css, internalProperty } from 'lit-element';
import { Router } from '@vaadin/router';
import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';

import { EveesHttp } from '@uprtcl/evees-http';
import { LTRouter } from '../router';

import { ConnectedElement } from '../services/connected.element';
import IntercreativityLogo from '../assets/intercreativity.svg';
import { ORIGIN } from '../utils/routes.generator';
import { NavigateTo404 } from '../utils/routes.helpers';
export class VisitorElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  pageId!: string;

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  remote: EveesHttp;

  async firstUpdated() {
    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();
    this.decodeUrl();
    this.loading = false;
  }

  async decodeUrl() {
    const routeParams = LTRouter.Router.location.params as any;
    const { userId, docId } = routeParams;
    if (routeParams.userId) {
      let authorId;
      try {
        const {
          object: { payload: { creatorId = null } = {} } = {},
        } = await this.evees.client.store.getEntity(docId);

        authorId = creatorId;
      } catch (e) {
        NavigateTo404();
      }

      if (authorId !== userId) NavigateTo404();
    }
    this.pageId = LTRouter.Router.location.params.docId as string;
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <app-appbar-public></app-appbar-public>
      <app-read-only-page uref=${this.pageId} />
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
        a {
          text-decoration: none;
        }

        .nav {
          display: flex;
          width: 100%;
          background: #fffffb;
          box-shadow: 0px 4px 14px rgba(14, 14, 44, 0.05);
          align-items: center;
          justify-content: start;
        }

        .nav-logo {
          left: 0;
        }
        .nav-logo svg {
          height: 5rem;
        }

        .nav-cta {
          padding: 1rem 1.7rem;

          background: #efeffd;
          color: #4260f6;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.1rem;
          transition: all 0.2s cubic-bezier(0.86, 0, 0.07, 1);
        }
        .nav-cta:hover {
          background: #f7f7ff;
        }
        .nav-cta-cont {
          display: flex;
          flex: 1;
          flex-direction: row-reverse;
          padding-right: 5%;
        }
      `,
    ];
  }
}
