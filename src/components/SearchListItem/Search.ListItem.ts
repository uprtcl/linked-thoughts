import { html, css, property, internalProperty } from 'lit-element';
import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export default class SearchListItem extends ConnectedElement {
  firstUpdated() {}

  async load() {}
  render() {
    return html`<div class="cont">
      <div class="header">
        <img class="profile-img" src="src/assets/profile.png" />
        <span class="author-name">Elon Musk</span>
      </div>
      <div class="content">
        <div class="title">
          The beginning of time started with all the best combinations of
          elements
        </div>
      </div>
      <div class="footer">
        <p class="publish-date">Sept 1</p>
      </div>
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
        }
        .cont {
          padding: 1rem 1.5rem;
        }
        .header {
          display: flex;
          /* justify-content: space-between; */
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .profile-img {
          height: 2rem;
          border-radius: 50%;
          margin-right: 1rem;
        }
        .author-name {
          color: #da3e52;
          font-size: 0.8rem;
        }
        .title {
          font-size: 1.3rem;
          font-weight: bold;
        }
        .publish-date {
          font-size: 0.8rem;
          color: #0007;
        }
      `,
    ];
  }
}
