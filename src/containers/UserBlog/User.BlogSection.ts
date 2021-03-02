import { html, css, internalProperty, property, query } from 'lit-element';
import lodash from 'lodash';
import { EveesBaseElement } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { LTRouter } from '../../router';
import { sharedStyles } from '../../styles';
import {
  GenerateDocumentRoute,
  GenerateSectionRoute,
} from '../../utils/routes.helpers';

import { APP_MANAGER } from '../../services/init';
import { AppManager } from '../../services/app.manager';

import { Section } from '../types';

const sectionHeight = 30;

export default class UserPublicBlogSection extends EveesBaseElement<Section> {
  @property({ type: String })
  uref: string;

  @property({ type: String })
  userId: string;

  // TODO request app mananger on an ConnectedEveeElement base class...
  appManager: AppManager;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }

  async firstUpdated() {
    await super.firstUpdated();
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`<div>
      <div class="cont">
        <div class="profileCont">
          <div class="author">
            TODO: Author Component
            <evees-author
              userId=${this.userId}
              uref=${this.uref}
              show-name
            ></evees-author>
          </div>
        </div>
        <div class="blogsCont">
          ${this.data.object.pages.map((pageId, pageIndex) => {
            return html`
              <app-user-page-blog-section-item
                uref=${pageId}
              ></app-user-page-blog-section-item>
            `;
          })}
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
        }
        .blogsCont {
          flex: 4;
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
