import { html, css, property, internalProperty, LitElement } from 'lit-element';
import { sharedStyles } from '../../styles';

export class BlockNotFound extends LitElement {
  render() {
    return html`<div class="cont">
      <span class="heading">Block Not Found</span>
    </div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          height: 100%;
          width: 100%;
          align-self: center;
        }
        .cont {
          width: 100%;
          min-height: 100px;
          height: 100%;
          display: flex;
          align-content: center;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          background: #ffd7d7;
        }
        .heading {
          font-size: 1.3rem;
          font-weight: bold;
        }
      `,
    ];
  }
}
