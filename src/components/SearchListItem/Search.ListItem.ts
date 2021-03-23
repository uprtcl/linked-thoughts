import { Perspective, Secured, EveesBaseElement } from '@uprtcl/evees';
import { html, css, property, internalProperty } from 'lit-element';
import { TimestampToDate } from '../../utils/date';
import { sharedStyles } from '../../styles';

export default class SearchListItem extends EveesBaseElement {
  @property()
  uref: string;

  @internalProperty()
  title: string;

  @internalProperty()
  userId: string;

  @internalProperty()
  loading: boolean = true;

  async firstUpdated() {
    await super.firstUpdated();
  }

  async load() {
    this.loading = true;
    await super.load();
    const data = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behaviorFirst(data.object, 'title');
    this.userId = await (await this.evees.client.store.getEntity(this.uref))
      .object.payload.creatorId;

    this.loading = false;
  }

  render() {
    if (this.loading) return null;

    return html`<div class="cont clickable">
      <div class="header">
        <evees-author
          remote-id=${this.evees.findRemote('http').id}
          user-id=${this.userId}
          show-name
        ></evees-author>
      </div>
      <div class="content">
        <div class="title">${this.title}</div>
      </div>
      <div class="footer">
        <p class="publish-date">
          ${TimestampToDate(this.head.object.payload.timestamp)}
        </p>
      </div>
    </div>`;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          height: 150px;
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
          font-family: 'Poppins';
        }
      `,
    ];
  }
}
