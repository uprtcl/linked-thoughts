import { html, css, internalProperty } from 'lit-element';
import lodash, { pad } from 'lodash';
import moment from 'moment';
import { Router } from '@vaadin/router';

import { styles } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import { sharedStyles } from '../../styles';
import { ORIGIN } from '../../utils/routes.generator';
export class ErrorPage extends EveesBaseElement {
  render() {
    return html`
      <div class="root">
        <header>
          <div class="header4">4</div>
          <div class="header0">0</div>
          <div class="header4">4</div>
        </header>

        <div class="subHeading">
          Sorry... The page you’re looking for does not exist
        </div>

        <a href=${ORIGIN} class="button">Go Home</a>
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
          padding: 0.5rem;
        }
        a {
          text-decoration: none;
        }

        .root {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          flex-direction: column;
        }

        header {
          font-weight: 600;
          font-size: 3.5rem;
          color: #fff;
          display: flex;
        }
        header > * {
          margin: 0 0.5rem;
          border-radius: 8px;
          padding: 1rem 1.5rem;
        }
        .header4 {
          background: #7e7e91;
        }
        .header0 {
          background: #f3d9da;
        }
        .subHeading {
          font-size: 1.1rem;
          text-align: center;
          margin: 1rem 0;
          padding: 1rem;
          border-bottom: 1px solid #9797aacf;
          font-weight: 500;
        }
        .banner {
          width: 100%;
          max-width: 720px;
        }
        .button {
          color: #fff;
          padding: 0.5rem 1rem;
          font-size: 1.1rem;
          background: #4260f6;
          box-shadow: 0px 6px 2px -4px rgba(14, 14, 44, 0.1),
            inset 0px -1px 0px rgba(14, 14, 44, 0.4);
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }
        .button:hover {
          background: #233fce;
        }
      `,
    ];
  }
}
