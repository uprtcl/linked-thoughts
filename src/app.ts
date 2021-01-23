import { LitElement, html, query, css } from 'lit-element';

import { LTRouter } from './router';
import { sharedStyles } from './styles';

export class App extends LitElement {
  @query('#outlet')
  outlet: HTMLElement;

  async firstUpdated() {
    LTRouter.setupRouter(this.outlet);
  }

  render() {
    return html`<div id="outlet"></div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          height: 100%;
          flex-direction: column;
          display: flex;
          justify-content: center;
          --mdc-theme-primary: #2196f3;
        }

        #outlet {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
      `,
    ];
  }
}
