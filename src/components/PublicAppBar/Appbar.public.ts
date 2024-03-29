import { html, css, internalProperty, property } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { EveesHttp } from '@uprtcl/evees-http';

import { sharedStyles } from '../../styles';
import { ConnectedElement } from '../../services/connected.element';
import { ORIGIN } from '../../router/routes.builder';

export default class AppBarPublic extends ConnectedElement {
  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  remote: EveesHttp;

  async firstUpdated() {
    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();
    this.loading = false;
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <div class="nav">
        <div class="nav-logo"></div>
        <div class="nav-cta-cont">
          <a class="nav-cta" href=${ORIGIN} target="_blank"
            >${this.isLogged ? 'Go to Dashboard' : 'Get Started'}
          </a>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
        }

        .nav {
          display: flex;
          background: #fffffb;
          box-shadow: 0px 4px 14px rgba(14, 14, 44, 0.05);
          align-items: center;
          justify-content: start;
          padding: 2vh 7vw;
        }

        .nav-logo {
          left: 0;
          width: 150px;
          height: 35px;
          background-color: red;
        }
        .nav-logo svg {
          height: 5rem;
        }

        .nav-cta {
          padding: 0.6rem 1.2rem;

          background: #efeffd;
          color: #4260f6;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1rem;
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
