import { html, css, internalProperty, property, LitElement } from 'lit-element';
import { servicesConnect } from '@uprtcl/evees-ui';
import { Logger } from '@uprtcl/evees';

export default class UserProfile extends servicesConnect(LitElement) {
  logger = new Logger('UserProfile}');

  @property({ type: String, attribute: 'user-id' })
  userId!: string;

  @property({ type: String, attribute: 'remote-id' })
  remoteId!: string;

  @property({ type: Boolean, attribute: 'show-name' })
  showName = false;

  render() {
    return html`<evees-author
      user-id=${this.userId}
      remote-id=${this.remoteId}
      ?show-name=${this.showName}
    ></evees-author>`;
  }
  static get styles() {
    return [
      css`
        evees-author {
          --font-size: 12px;
          --font-weight: 500;
          --font-color: #da3e52;
        }
      `,
    ];
  }
}
