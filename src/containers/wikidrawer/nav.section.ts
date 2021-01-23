import { html, css, internalProperty } from 'lit-element';
import { Entity, eveesConnect } from '@uprtcl/evees';
import { LitElement, property } from 'lit-element';
import { Section } from './types';

export class NavSectionElement extends eveesConnect(LitElement) {
  @property()
  uref: string;

  @internalProperty()
  loading = true;

  sectionData: Entity<Section>;

  async firstUpdated() {
    this.loading = true;
    this.sectionData = await this.evees.getPerspectiveData(this.uref);
    this.loading = false;
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`<h2>${this.sectionData.object.title}</h2>
      <uprtcl-list>
        ${this.sectionData.object.pages.map(
          (pageId) =>
            html`<app-nav-page-item uref=${pageId}></app-nav-page-item>`
        )}
      </uprtcl-list>`;
  }
}
