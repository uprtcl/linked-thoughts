import { LitElement, html, css, property } from 'lit-element';
import { moduleConnect } from '@uprtcl/micro-orchestrator';
import { EveesInfoConfig } from '@uprtcl/evees';

import { Router } from '@vaadin/router';

export class Doc extends moduleConnect(LitElement) {
  @property({ attribute: false })
  docId!: string;

  @property({ attribute: false })
  defaultRemote!: string;

  @property({ attribute: false })
  loading: boolean = true;

  async firstUpdated() {
    this.loading = true;
    this.docId = window.location.pathname.split('/')[2];
    this.loading = false;
  }

  goHome() {
    Router.go(`/home`);
  }

  render() {
    if (this.docId === undefined) return '';
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    const eveesInfoConfig: EveesInfoConfig = {
      showProposals: true,
      showAcl: true,
      showInfo: true,
      showIcon: true,
      showDraftControl: true,
      checkOwner: true,
      showMyDraft: true,
    };

    return html`
      <wiki-drawer
        uref=${this.docId}
        .eveesInfoConfig=${eveesInfoConfig}
        @back=${() => this.goHome()}
      ></wiki-drawer>
    `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    wiki-drawer {
      flex-grow: 1;
    }
  `;
}
