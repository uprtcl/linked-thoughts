import { html, css, internalProperty, LitElement } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';

import { EveesHttp } from '@uprtcl/evees-http';
import { Router } from '@vaadin/router';

import { Home } from '../constants/routeNames';
import { ConnectedElement } from '../services/connected.element';
import { AUTH0_CONNECTION, ETH_ACCOUNT_CONNECTION } from '../services/init';
import { HttpMultiConnection } from '@uprtcl/http-provider';
import TreesBackground from '../assets/trees.png';
import Home1Background from '../assets/illustrations/home-1.svg';
import IntercreativityLogo from '../assets/intercreativity.svg';
import GoogleIcon from '../assets/icons/google.svg';
import FBIcon from '../assets/icons/facebook.svg';
export class GettingStartedElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  hasWeb3 = false;

  remote: EveesHttp;

  async firstUpdated() {
    this.hasWeb3 = window['ethereum'] !== undefined;
    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      Router.go(Home);
    }

    this.loading = false;
  }

  async login(connectionId: string) {
    const multiConnection: HttpMultiConnection = this.remote.connection as any;

    multiConnection.select(connectionId);
    const connection = multiConnection.connection();
    await connection.login();

    this.isLogged = await this.remote.isLogged();
    Router.go(Home);
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <div class="root">
        <div class="login-cont">
          ${IntercreativityLogo}

          <div class="login-card">
            <h1>Log In</h1>
            <div
              class="loginButton"
              @click=${() => this.login(AUTH0_CONNECTION)}
            >
              Continue with Web2 ( ${GoogleIcon} | ${FBIcon} )
            </div>
            <div
              class="loginButton"
              ?disabled=${!this.hasWeb3}
              @click=${() => this.login(ETH_ACCOUNT_CONNECTION)}
            >
              Continue with Web3(Metamask)
            </div>

            ${!this.hasWeb3
              ? html`<a target="_blank" href="https://metamask.io/"
                  >Rabbit Hole</a
                >`
              : ''}
          </div>
        </div>
        <div>
          <div class="bkg-illustration">${Home1Background}</div>
          <div class="content">
            <h2>Your place to Create</h2>
            <h3 class="description">
              Wether you’re a writer, a product manager, a student or just
              someone who likes taking notes, Intercreativity proposes a new
              solution to content sharing.
            </h3>
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      styles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          color: #262641;
        }

        h1 {
          font-weight: 700;
          font-size: calc(2rem + 1vmin);
        }
        a {
          color: #da3e52;
        }
        .loginButton {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 12px 32px;

          background: #ffffff;
          /* Iris-10 */

          border: 2px solid #efeffd;
          box-sizing: border-box;
          border-radius: 8px;
          min-width: 300px;
          width: 50%;
          cursor: pointer;
          margin-bottom: 0.7rem;
        }

        .loginButton > svg {
          height: 1.1rem;
        }

        .loginButton[disabled] {
          border: 2px solid #efeffd;
          color: #5c5c77;
          cursor: not-allowed;
        }
        .root {
          flex-direction: row;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          display: flex;
        }
        .root > * {
          justify-content: center;
          align-items: center;
          display: flex;
          flex: 1;
          height: 100%;
          flex-direction: column;
          position: relative;
        }
        .bkg-illustration {
          right: 1rem;
          position: absolute;
          z-index: -2;
        }
        .bkg-img {
          position: absolute;
          z-index: -2;
        }
        .login-card {
          background: #ffffff;
          box-shadow: 0px 50px 100px -8px rgba(14, 14, 44, 0.12);
          border-radius: 10px;
          width: 70%;
          height: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .content {
          text-align: center;
          width: 70%;
          font-weight: 700;
        }
        .description {
          color: #5c5c77;
          font-weight: 500;
        }
        .login-cont {
          background-image: url('src/assets/trees.png');
          background-repeat: no-repeat;
          background-size: cover;
          width: 100%;
        }
        uprtcl-button {
          width: 300px;
          margin: 16px 0px 6px 0px;
        }

        @media only screen and (max-width: 900px) {
          .root {
            display: block;
          }
          .root > * {
            height: 70%;
          }
          .bkg-illustration {
            display: none;
          }
        }
      `,
    ];
  }
}
