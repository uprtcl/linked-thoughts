import { LitElement } from 'lit-element';
import { servicesConnect } from '@uprtcl/evees';
import { APP_MANAGER } from './init';
import { AppManager } from './app.manager';

export class ConnectedElement extends servicesConnect(LitElement) {
  appManager: AppManager;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }
}
