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
          --primary: #4260f6;
          --secondary: #333333;
          --white: #ffffff;
          --black: #000000;
          --black-transparent: rgba(3, 3, 3, 0.25);
          --gray-dark: #333333;
          --gray-light: #828282;
          --gray-text: #9797aa;
          --gray-hover: #c4c4c478;
          --border-radius-complete: 0.5rem;
          --background-color: #fffffb;
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
