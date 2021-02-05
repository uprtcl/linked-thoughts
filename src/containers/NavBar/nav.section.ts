import { html, css, internalProperty, property } from 'lit-element';
import lodash from 'lodash';
import { EveesBaseElement } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { LTRouter } from '../../router';
import { sharedStyles } from '../../styles';
import { GenerateSectionRoute } from '../../utils/routes.helpers';

import PlusSquareIcon from '../../assets/icons/plus-square.svg';
import { APP_MANAGER } from '../../services/init';
import { AppManager } from '../../services/app.manager';

import { Section } from '../types';

export class NavSectionElement extends EveesBaseElement<Section> {
  @property({ type: String })
  uref: string;

  @property({ type: Number })
  idx: number = 0;

  @internalProperty()
  selectedId: string;

  // TODO request app mananger on an ConnectedEveeElement base class...
  appManager: AppManager;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
    window.addEventListener('popstate', () => this.decodeUrl());
  }

  async firstUpdated() {
    await super.firstUpdated();
    this.decodeUrl();
  }

  decodeUrl() {
    if (LTRouter.Router.location.params.docId) {
      this.selectedId = LTRouter.Router.location.params.docId as string;
    } else if (LTRouter.Router.location.params.sectionId)
      this.selectedId = LTRouter.Router.location.params.sectionId as string;
  }
  async newPage() {
    await this.appManager.newPage(this.uref);
  }

  navigateSection() {
    Router.go(GenerateSectionRoute(this.uref));
  }
  async deletePerspective(pageId: string) {
    const confirmResponse = window.confirm(
      'Are you sure you want to delete this item?'
    );

    if (confirmResponse === true) {
      lodash.remove(this.data.object.pages, (id) => id === pageId);
      await this.evees.updatePerspectiveData(this.uref, this.data.object);
      await this.evees.client.flush();

      Router.go(GenerateSectionRoute(this.uref));
    }
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
        <span @click=${this.newPage} class="add-page-button"
          >${PlusSquareIcon}</span
        >
      </section>
      <uprtcl-list class="page-list">
        ${this.data.object.pages.map((pageId, pageIndex) => {
          return html`<app-nav-page-item
            ?selected=${this.selectedId === pageId ? true : false}
            uref=${pageId}
            ui-parent=${this.uref}
            idx=${pageIndex}
            .deleteCurrentPerspective=${() => this.deletePerspective(pageId)}
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

        .page-list {
          overflow-y: scroll;
          max-height: 40vh;
          background-image: linear-gradient(
            0deg,
            rgba(255, 0, 0, 0),
            rgba(220, 220, 220, 0.5)
          );
        }
        .page-list::-webkit-scrollbar {
          width: 5px;
          display: block;
          scrollbar-width: 8px; /* Firefox */
        }

        .page-list::-webkit-scrollbar-track {
          /* box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3); */
        }

        .page-list::-webkit-scrollbar-thumb {
          background-color: var(--black-transparent, #0003);
          border-radius: 1rem;
        }
        .section-heading {
          font-size: 1.2rem;
          text-transform: uppercase;
          font-weight: 600;
          color: grey;
          padding-left: 2rem;
          padding-bottom: 0.3rem;
          padding-top: 0.3rem;
          display: flex;
          align-items: center;
        }
        .add-page-button {
          margin-left: 1.5rem;
          display: flex;
        }
      `,
    ];
  }
}
