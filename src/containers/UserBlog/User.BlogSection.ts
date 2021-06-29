import { html, css, property } from 'lit-element';

import { Logger } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';

import { sharedStyles } from '../../styles';
import { ConnectedElement } from '../../services/connected.element';

import {
  BlockViewType,
  CollectionConfig,
  HeaderViewType,
} from '../Collections/collection.base';

export default class UserPublicBlogSection extends ConnectedElement {
  logger = new Logger('UserPublicBlogSection');

  @property({ type: String })
  uref: string;

  @property({ type: String })
  userId: string;

  render() {
    const config: CollectionConfig = {
      headerView: HeaderViewType.feed,
      blockView: BlockViewType.pageFeedItem,
      searchTopRight: true,
    };

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
          <app-evees-data-collection
            uref=${this.uref}
            .config=${config}
            block-view=${BlockViewType.pageFeedItem}
          ></app-evees-data-collection>
        </div>
      </div>
    </div>`;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        .cont {
          display: flex;
        }
        .profileCont {
          flex: 1;
        }
        .author {
          margin-top: 5%;
          width: 80%;gas
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
