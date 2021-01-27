import { html, css, internalProperty } from 'lit-element';
import { EveesBaseElement } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { LTRouter } from '../../router';
import { sharedStyles } from '../../styles';
import { GenerateSectionRoute } from '../../utils/routes.helpers';
import { Section } from '../types';
export class NavSectionElement extends EveesBaseElement<Section> {
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
        ${this.data.object.title}
      </section>
      <uprtcl-list>
        ${this.data.object.pages.map((pageId) => {
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
