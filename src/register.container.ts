import { LitElement, html } from 'lit-element';

export const REQUEST_EVENT_TAG = 'request-dependency';

export class RequestDependencyEvent extends CustomEvent<{}> {
  dependency!: any;

  constructor(eventInitDict?: CustomEventInit<{ id: string }>) {
    super(REQUEST_EVENT_TAG, eventInitDict);
  }
}

export function AppContainer(services: Map<string, any>): typeof HTMLElement {
  class ModuleContainer extends LitElement {
    services: Map<string, any>;

    constructor() {
      super();
      this.services = services;
    }

    connectedCallback() {
      super.connectedCallback();

      this.addEventListener<any>(
        REQUEST_EVENT_TAG,
        (e: RequestDependencyEvent) => {
          e.stopPropagation();
          e.dependency = this.services.get(e.detail.id);
        }
      );
    }

    render() {
      return html` <slot></slot> `;
    }
  }

  return ModuleContainer;
}
