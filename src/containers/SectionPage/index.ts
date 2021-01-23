import { html, css, internalProperty, LitElement, property } from 'lit-element';

import { styles } from '@uprtcl/common-ui';
import { Entity, eveesConnect } from '@uprtcl/evees';
import { MenuConfig } from '@uprtcl/common-ui';
import { TextNode } from '@uprtcl/documents';
import { Router } from '@vaadin/router';

import { GenerateDocumentRoute } from '../../utils/routes.helpers';
import { Section } from '../types';
export class SectionPage extends eveesConnect(LitElement) {
  @property()
  uref: string;

  @internalProperty()
  loading = true;

  sectionData: Entity<Section>;

  async firstUpdated() {
    this.loading = true;
    debugger;
    this.sectionData = await this.evees.getPerspectiveData(this.uref);
    debugger;
    this.loading = false;
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`<ul> ${this.sectionData.object.pages.map(
      (pageId) => html`<li>${pageId}</li>`
    )}</ul>`;
  }
  static get styles() {
    return [
      styles,
      css`
        :host {
        }

        .page-item-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0.1rem 0.25rem;
          padding-left: 2.2rem;
          transition: background 0.1s ease-in-out;
        }
        .page-item-row:hover {
          background: #0001;
        }
        .text-container {
          flex: 1;
        }
      `,
    ];
  }
}
