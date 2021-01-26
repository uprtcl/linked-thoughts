import { html, css, internalProperty, LitElement, property } from 'lit-element';
import { ClientEvents, Entity, eveesConnect } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { GenerateSectionRoute } from '../../utils/routes.helpers';
import { LTRouter } from '../../router';
import { Section } from '../types';
import { sharedStyles } from '../../styles';
export class NavSectionElement extends eveesConnect(LitElement) {
  @property()
  uref: string;

  @property()
  sectionIndex: number;

  @internalProperty()
  loading = true;

  sectionData: Entity<Section>;

  @internalProperty()
  selectedId: string;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', () => this.decodeUrl());
  }

  decodeUrl() {
    if (LTRouter.Router.location.params.docId) {
      this.selectedId = LTRouter.Router.location.params.docId as string;
    } else if (LTRouter.Router.location.params.sectionId)
      this.selectedId = LTRouter.Router.location.params.sectionId as string;
  }
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

    let classes: string[] = [];
    classes.push('section-heading clickable');
    if (this.selectedId === this.uref) {
      classes.push('selected-item');
    }

    return html`<section
        class=${classes.join(' ')}
        @click=${this.navigateSection}
      >
        ${this.sectionData.object.title}
      </section>
      <uprtcl-list>
        ${this.sectionData.object.pages.map((pageId) => {
          return html`<app-nav-page-item
            ?selected=${this.selectedId === pageId ? true : false}
            uref=${pageId}
          ></app-nav-page-item>`;
        })}
      </uprtcl-list>`;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
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
          padding-left: 2rem;
          padding-bottom: 0.3rem;
          padding-top: 0.3rem;
        }
      `,
    ];
  }
}
