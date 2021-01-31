import { html, css, internalProperty } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';

import { EveesHttp } from '@uprtcl/evees-http';
import { LTRouter } from '../router';

import { ConnectedElement } from '../services/connected.element';

export class VisitorElement extends ConnectedElement {
  logger = new Logger('Dashboard');

  @internalProperty()
  pageId!: string;

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  remote: EveesHttp;

  async firstUpdated() {
    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();
    this.decodeUrl();
    this.loading = false;
  }

  async decodeUrl() {
    this.pageId = LTRouter.Router.location.params.pageId as string;
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <documents-editor class="" uref=${this.pageId} read-only>
      </documents-editor>
    `;
  }

  static get styles() {
    return [
      styles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
        }
      `,
    ];
  }
}
