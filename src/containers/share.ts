import { LitElement, html, css, property } from 'lit-element';

export default class ShareCard extends LitElement {
  render() {
    return html`<div class="share-card-cont">
      <div class="content">
        <div>
          <div class="heading">Share to Blog</div>
          <div class="description">
            by Sharing this document on the Blog space<br />it will becomes
            public
          </div>
        </div>
        <div class="toggle-cont">
          <uprtcl-toggle .active=${true}></uprtcl-toggle>
        </div>
      </div>
    </div>`;
  }

  static get styles() {
    return css`
      :host {
        font-family: 'Poppins', sans-serif;
      }
      .share-card-cont {
        background-color: var(--white, #ffffff);
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
      }
      .content {
        padding: 0.5rem 1rem 1rem;
        display: flex;
      }
      .heading {
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 2;
      }
      .description {
        font-size: 1rem;
        font-weight: 400;
      }
      .toggle-cont {
        margin-left: 1rem;
        display: flex;
        align-items: center;
      }
    `;
  }
}

// <!-- .disabled=${this.permissions.delegate} -->
// <!-- @toggle-click=${this.togglePublicWrite}></uprtcl-toggle -->