import { EveesBaseElement, servicesConnect } from '@uprtcl/evees';
import { APP_MANAGER } from './init';
import { AppManager } from './app.manager';

export class ConnectedEveeElement<T> extends servicesConnect(EveesBaseElement) {
  appManager: AppManager;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }
}
