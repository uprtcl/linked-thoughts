import { html, css, internalProperty, LitElement, property } from 'lit-element';
import { ClientEvents, Entity, eveesConnect } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { GenerateSectionRoute } from '../../utils/routes.helpers';
import { LTRouter } from '../../router';
import { Section } from '../types';
export class NavSectionElement extends eveesConnect(LitElement) {
  @property()
  uref: string;

  @internalProperty()
  loading = true;

  sectionData: Entity<Section>;

  async firstUpdated() {
    this.loading = true;
    this.evees.client.events.on(ClientEvents.updated, (perspectives) =>
      this.perspectiveUpdated(perspectives)
    );
    await this.load();
    this.loading = false;
  }

  perspectiveUpdated(perspectives: string[]) {
    if (perspectives.includes(this.uref)) {
      this.load();
    }
  }

  async load() {
    this.sectionData = await this.evees.getPerspectiveData(this.uref);
    this.requestUpdate();
  }

  navigateSection() {
    Router.go(GenerateSectionRoute(this.uref));
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`<section class="section-heading" @click=${this.navigateSection}>
        ${this.sectionData.object.title}
      </section>
      <uprtcl-list>
        ${this.sectionData.object.pages.map(
          (pageId) =>
            html`<app-nav-page-item uref=${pageId}></app-nav-page-item>`
        )}
      </uprtcl-list>`;
  }
  static get styles() {
    return [
      styles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          margin-top: 2rem;
        }
        .section-heading {
          font-size: 1.2rem;
          text-transform: uppercase;
          font-weight: 600;
          color: grey;
          margin-left: 2rem;
          margin-bottom: 0.2rem;
        }
      `,
    ];
  }
}
