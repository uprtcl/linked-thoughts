import { html, css, property, internalProperty } from 'lit-element';

import { EveesBaseElement } from '@uprtcl/evees-ui';
import CloseIcon from '../../assets/icons/x-black.svg';
import { TimestampToDate } from '../../utils/date';
import { sharedStyles } from '../../styles';

export default class ClipboardListItem extends EveesBaseElement {
  @property()
  uref: string;

  @property()
  tags: string[] = ['Fork'];

  @internalProperty()
  title: string;

  @internalProperty()
  loading: boolean = true;
  @internalProperty()
  hasError: boolean = true;

  async firstUpdated() {
    await super.firstUpdated();
  }

  async load() {
    this.loading = true;
    this.hasError = false;
    try {
      await super.load();

      const data = await this.evees.getPerspectiveData(this.uref);
      this.title = this.evees.behaviorFirst(data.object, 'title');
    } catch (e) {
      if (!this.data) {
        this.hasError = true;
      }
    }

    this.loading = false;
  }

  renderTags() {
    if (Array.isArray(this.tags) && this.tags.length > 0)
      return html`
        <div class="tag-cont">
          ${this.tags.map((e) => {
            return html`<span class="tag">${e}</span>`;
          })}
        </div>
      `;
  }
  render() {
    if (this.loading) return null;
    if (this.hasError)
      return html`<app-error-block-not-found></app-error-block-not-found>`;
    return html`<div class="cont clickable">
        <div class="header">
          ${this.renderTags()} <span> ${CloseIcon} </span>
        </div>
        <div class="content">
          <div class="title">${this.title}</div>
        </div>
        <div class="footer">
          <p class="publish-date">
            ${TimestampToDate(this.head.object.payload.timestamp)}
          </p>
        </div>
      </div>
      <div class="hr"></div> `;
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          min-height: 150px;
          min-width: 33%;
          position: relative;
        }
        .cont {
          padding: 1rem 1.5rem;
        }
        .hr {
          border-bottom: 1px solid #e0e0e0;
          width: 100%;
          margin: 0 1rem;
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

        .title {
          font-size: 1.3rem;
          font-weight: bold;
        }
        .publish-date {
          font-size: 0.8rem;
          color: #0007;
          font-family: 'Poppins';
        }
        .tag-cont {
          display: inline-block;
          flex: 1;
        }
        .tag {
          background: #9797aa;
          color: var(--white);
          font-size: 0.7rem;
          padding: 0.1rem 0.5rem;
          border-radius: 1rem;
          font-weight: 500;
        }
      `,
    ];
  }
}
