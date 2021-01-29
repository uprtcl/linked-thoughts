import { LitElement } from 'lit-element';
import { AppElements, Evees, servicesConnect } from '@uprtcl/evees';
import { APP_ELEMENTS } from './init';

export class ConnectedElement extends servicesConnect(LitElement) {
  appElements: AppElements;

  connectedCallback() {
    super.connectedCallback();
    this.appElements = this.request(APP_ELEMENTS);
  }
}
