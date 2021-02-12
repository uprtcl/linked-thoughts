import { html, css, internalProperty } from 'lit-element';
import lodash, { pad } from 'lodash';
import moment from 'moment';
import { Router } from '@vaadin/router';

import { styles } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import Image404 from '../../assets/404.png';
import { sharedStyles } from '../../styles';

export class ErrorPage extends EveesBaseElement {
  render() {
    return html`
      <div class="root">
        <div class="heading">YOU JUST GOT 404'D</div>
        <div class="subHeading">
          THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST :'(
        </div>
        <br />
        <a href=${window.location.origin}>Go back to Home</a>
        <img class="banner" src=${Image404} />
      </div>
    `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          height: 100%;
          width: 100%;
          background: #ccc3;
        }
        .root {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          flex-direction: column;
        }
        .heading {
          font-weight: bold;
          font-size: 2rem;
        }
        .subHeading {
          font-size: 1.1rem;
        }
        .banner {
          width: 100%;
          max-width: 720px;
        }
      `,
    ];
  }
}
