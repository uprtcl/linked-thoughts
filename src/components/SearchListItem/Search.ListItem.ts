import { Signed, Commit } from '@uprtcl/evees';
import { html, css, property, internalProperty, svg } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

import { getRandomAvatar } from '@fractalsoftware/random-avatar-generator';

export default class SearchListItem extends ConnectedElement {
  @property()
  uref: string;

  @internalProperty()
  title: string;

  @internalProperty()
  meta;

  loading: boolean = true;
  async firstUpdated() {
    await this.load();
  }

  async load() {
    this.loading = true;
    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
    this.meta = await (await this.evees.client.store.getEntity(this.uref))
      .object.payload;
    // debugger;
    this.loading = false;
  }
  render() {
    if (this.loading) return null;
    return html`<div class="cont clickable">
      <div class="header">
        <div class="profile-img">${html`${unsafeHTML(getRandomAvatar())}`}</div>
        <span class="author-name">${this.meta.creatorId}</span>
      </div>
      <div class="content">
        <div class="title">${this.title}</div>
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
        .cont:hover {
          background: #00000008;
        }
        .header {
          display: flex;
          /* justify-content: space-between; */
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .profile-img {
          height: 2rem;
          width: 2rem;
          border-radius: 50%;
          margin-right: 1rem;
          overflow: hidden;
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
