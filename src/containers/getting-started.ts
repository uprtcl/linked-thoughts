import { html, css, internalProperty } from 'lit-element';
import { Router } from '@vaadin/router';

import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';
import { HttpMultiConnection } from '@uprtcl/http-provider';

import { EveesHttp } from '@uprtcl/evees-http';

import { Home } from '../constants/routeNames';
import { ConnectedElement } from '../services/connected.element';
import { DeleteLastVisited } from '../utils/localStorage';
import { AUTH0_CONNECTION, ETH_ACCOUNT_CONNECTION } from '../services/init';

import IntercreativityLogo from '../assets/intercreativity.svg';
import GoogleIcon from '../assets/icons/google.svg';
import FBIcon from '../assets/icons/facebook.svg';
import MetamaskIcon from '../assets/icons/metamask.svg';
import Home1Background from '../assets/illustrations/home-1.svg';
import Home21Background from '../assets/illustrations/home-2-1.svg';
import Home22Background from '../assets/illustrations/home-2-2.svg';
import Home3Background from '../assets/illustrations/home-3.svg';
import Home4Background from '../assets/illustrations/home-4.svg';

export class GettingStartedElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  hasWeb3 = false;

  @internalProperty()
  carouselSelectedIndex: number = 0;

  @internalProperty()
  loginError: string;

  carouselSelectedIndexIntervel;

  remote: EveesHttp;

  carouselLength = 4;

  async firstUpdated() {
    this.hasWeb3 = window['ethereum'] !== undefined;
    this.remote = (this.evees.getRemote() as any).base as EveesHttp;
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      Router.go(Home);
    }
    this.carouselAttachTimer();
    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  carouselAttachTimer() {
    const self = this;
    this.carouselSelectedIndexIntervel = setInterval(() => {
      self.carouselSelectedIndex =
        (self.carouselSelectedIndex + 1) % self.carouselLength;
    }, 10000);
  }
  carouselDetachTimer() {
    clearInterval(this.carouselSelectedIndexIntervel);
  }
  carouselResetTimer() {
    this.carouselDetachTimer();
    this.carouselAttachTimer();
  }

  carouselNavigation(action: 'prev' | 'next') {
    if (action === 'prev') {
      let newPosition = this.carouselSelectedIndex - 1;
      if (newPosition < 0) {
        newPosition = this.carouselLength - 1;
      }

      this.carouselSelectedIndex = newPosition;
    } else if (action === 'next') {
      this.carouselSelectedIndex =
        (this.carouselSelectedIndex + 1) % this.carouselLength;
    }
    this.carouselDetachTimer();
  }

  disconnectedCallback() {
    this.carouselDetachTimer();
  }
  async login(connectionId: string) {
    const multiConnection: HttpMultiConnection = this.remote.connection as any;

    multiConnection.select(connectionId);
    const connection = multiConnection.connection();

    try {
      await connection.login();

      this.isLogged = await this.remote.isLogged();
      if (this.isLogged) {
        Router.go(Home);
      } else {
        this.loginError = 'Error loggin in';
      }
    } catch (e) {
      DeleteLastVisited();
      this.loginError = 'Error loggin in';
    }
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <div class="root">
        <div class="main-space">
          <div class="login-cont">
            ${IntercreativityLogo}

            <div class="login-card">
              <div class="heading">Log In</div>
              <div
                class="login-button"
                @click=${() => this.login(AUTH0_CONNECTION)}
              >
                Continue with social networks (${GoogleIcon},${FBIcon})
              </div>
              <div
                class="login-button"
                ?disabled=${!this.hasWeb3}
                @click=${() => this.login(ETH_ACCOUNT_CONNECTION)}
              >
                Continue with Ethereum (${MetamaskIcon})
              </div>

              ${!this.hasWeb3
                ? html`<a target="_blank" href="https://metamask.io/"
                    >What’s this?</a
                  >`
                : ''}
              ${!this.loginError ? html`<div>${this.loginError}</div>` : ''}
            </div>
          </div>

          <div class="carousel-container">
            <div class="carousel-action">
              <div
                class="carousel-prev carousel-navigation-button"
                @click=${() => this.carouselNavigation('prev')}
              >
                <-
              </div>
              <div
                class="carousel-next carousel-navigation-button"
                @click=${() => this.carouselNavigation('next')}
              >
                ->
              </div>
            </div>
            <ui5-carousel
              class="carousel-cont"
              cyclic="false"
              selected-index=${this.carouselSelectedIndex}
              hide-navigation
            >
              <div class="carousel-item">
                <div class="bkg-illustration right top">${Home1Background}</div>
                <div class="content">
                  <h2>Borderless</h2>
                  <h3 class="description">
                    Create and share your ideas the way <i>you</i> want, on an
                    open ecosystem of multiple applications, platforms, rules,
                    and types of content.
                  </h3>
                </div>
              </div>
              <div class="carousel-item">
                <div class="bkg-illustration right top">
                  ${Home21Background}
                </div>
                <div class="bkg-illustration left bottom">
                  ${Home22Background}
                </div>
                <div class="content">
                  <h2>Connect with Others</h2>
                  <h3 class="description">
                    Build your personal "graph" of ideas. Decide what you want
                    to share. Discover other's work, and connect it with yours.
                  </h3>
                </div>
              </div>
              <div class="carousel-item">
                <div class="bkg-illustration right bottom">
                  ${Home3Background}
                </div>

                <div class="content">
                  <h2>Explore A Decentralized World</h2>
                  <h3 class="description">
                    Use a familiar web-hosting service or dive into emerging
                    decentralized technologies to publish and govern your
                    content and that of your community, onchain.
                  </h3>
                </div>
              </div>
              <div class="carousel-item">
                <div class="bkg-illustration right top">${Home4Background}</div>

                <div class="content">
                  <h2>Open your Mind</h2>
                  <h3 class="description">
                    Combine and remix your content with that of others. Fork and
                    evolve. Propose and merge.
                  </h3>
                </div>
              </div>
            </ui5-carousel>
          </div>
        </div>
        <div class="footer">
          <div class="left">
            <a
              class="uprtcl-link"
              target="_blank"
              href="https://github.com/uprtcl"
            >
              Powered by <img src="src/assets/icons/logo-uprtcl.png" />
            </a>
          </div>
          <div class="right">
            <div class="social-icon">
              <a target="_blank" href="https://t.me/joinchat/FAyNso5dWuZN3-MO">
                <img src="src/assets/icons/telegram.png"
              /></a>
            </div>
            <div class="social-icon">
              <a target="_blank" href="https://twitter.com/uprtcl">
                <img src="src/assets/icons/twitter.png"
              /></a>
            </div>
            <div class="social-icon discord">
              <a target="_blank" href="https://discord.gg/QRt6WdyGNx">
                <img src="src/assets/icons/discord.png"
              /></a>
            </div>
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
        .login-button {
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
          min-width: 200px;
          width: 90%;
          max-width: 400px;
          cursor: pointer;
          margin-bottom: 0.7rem;
          user-select: none;
        }

        .login-button > svg {
          height: 1.1rem;
          width: 1.1rem;
          padding: 0 0.2rem;
        }

        .loginButton[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button:hover {
          background-color: #efeffd;
        }

        .root {
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .main-space > * {
          flex: 1 0 auto;
          justify-content: center;
          align-items: center;
          display: flex;
          flex: 1;
          height: 100%;
          flex-direction: column;
          position: relative;
        }
        .main-space {
          height: 100%;
          width: 100%;
        }
        .login-cont {
          background-image: url('src/assets/trees.png');
          background-repeat: no-repeat;
          background-size: cover;
          width: 50%;
          float: left;
        }
        .carousel-container {
          width: 50%;
          float: left;
          overflow: hidden;
        }
        .footer {
          height: 10vh;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .bkg-illustration {
          position: absolute;
          z-index: 1;
        }
        .top {
          top: 10%;
        }
        .right {
          right: 10px;
        }
        .left {
          left: 0;
        }
        .bottom {
          bottom: 0;
        }
        .bkg-img {
          position: absolute;
          z-index: -2;
        }
        .carousel-cont {
          --sapBackgroundColor: #f5f5f5;
        }
        .login-card {
          background: #ffffff;
          box-shadow: 0px 50px 100px -8px rgba(14, 14, 44, 0.12);
          border-radius: 10px;
          width: 90%;
          height: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          max-width: 550px;
          max-height: 500px;
        }
        .login-card .heading {
          font-weight: bold;
          font-size: 40px;
          line-height: 140%;
          color: #262641;
          margin-bottom: 2rem;
        }
        .content {
          text-align: center;
          width: 70%;
          font-weight: 700;
          width: 100%;
          max-width: 600px;
          z-index: 2;
        }
        .content h2 {
          margin-bottom: 2.5rem;
        }
        .description {
          color: #5c5c77;
          font-weight: 500;
          font-size: 20px;
          line-height: 176%;
        }

        .carousel-item {
          position: relative;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 20%;
          background-color: #f5f5f5;
          width: 100%;
        }
        .carousel-action {
          position: absolute;
          z-index: 3;
          width: 100%;
        }
        .carousel-navigation-button {
          cursor: pointer;
          font-size: 2rem;
          font-weight: bold;
          display: inline-block;
          position: absolute;
          opacity: 0.3;
          transition: all 0.2s ease;
          padding: 0.5rem 0.7rem;
          transform: scale(0.7);
          user-select: none;
        }
        .carousel-navigation-button:hover {
          opacity: 1;
          background: #fafafa;
          transform: scale(1);
          box-shadow: 0px 10px 20px rgba(14, 14, 44, 0.1);
          border-radius: 200px;
        }
        .carousel-navigation-button:active {
          transform: scale(0.8);
        }
        .carousel-prev {
          left: 1.2rem;
        }
        .carousel-next {
          right: 1.2rem;
        }
        uprtcl-button {
          width: 300px;
          margin: 16px 0px 6px 0px;
        }
        ui5-carousel {
          width: 50vw;
        }

        .footer a {
          text-decoration: none;
          color: black;
        }
        .footer .left {
          padding: 0 7vw;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
        }
        .footer .left img {
          margin-left: 0.75rem;
          height: 28px;
        }
        .footer .left .uprtcl-link {
          display: flex;
          align-items: center;
        }
        .footer .right {
          padding: 0 7vw;
          flex: 0 0 auto;
          display: flex;
        }
        .footer .right .social-icon.discord {
          height: 24px;
        }
        .footer .right .social-icon {
          padding: 0 2vw;
          height: 20px;
        }

        .footer .right .social-icon img {
          height: 100%;
        }

        @media only screen and (max-width: 900px) {
          .root {
            display: block;
          }
          .main-space > * {
            /* height: 70%; */
          }
          .login-cont {
            width: 100%;
          }
          .carousel-container {
            width: 100%;
          }
          ui5-carousel {
            width: 100vw;
          }
        }
      `,
    ];
  }
}
