import { html, css } from 'lit-element';

import { ConnectedElement } from './services/connected.element';
import { Router } from '@vaadin/router';
export class AppEntry extends ConnectedElement {
  async login() {
    const remote = this.evees.findRemote('http');
    await remote.login();
    Router.go('/home');
  }

  render() {
    return html`<h1>Welcome</h1>
      <uprtcl-button @click=${() => this.login()}>login</uprtcl-button> `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      text-align: center;
      height: 80vh;
      padding: 10vh 10px;
    }
  `;
}
