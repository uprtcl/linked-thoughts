import { html, css } from 'lit-element';
import { EveesBaseElement } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { GenerateSectionRoute } from '../../utils/routes.helpers';
import { Section } from '../types';
export class NavSectionElement extends EveesBaseElement<Section> {
  navigateSection() {
    Router.go(GenerateSectionRoute(this.uref));
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html`<section class="section-heading" @click=${this.navigateSection}>
        ${this.data.object.title}
      </section>
      <uprtcl-list>
        ${this.data.object.pages.map(
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
