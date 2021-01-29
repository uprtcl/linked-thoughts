import { LitElement } from 'lit-element';
import { AppElements, Evees, servicesConnect } from '@uprtcl/evees';
import { APP_ELEMENTS, EVEES } from './init';

export class ConnectedElement extends servicesConnect(LitElement) {
  evees: Evees;
  appElements: AppElements;

  connectedCallback() {
    super.connectedCallback();
    this.evees = this.request(EVEES);
    this.appElements = this.request(APP_ELEMENTS);
  }
}
