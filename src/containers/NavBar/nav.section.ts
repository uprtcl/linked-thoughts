import { html, css, internalProperty, property, query } from 'lit-element';
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

const sectionHeight = 150;

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

    /** same as value */
    let overlayClass = [];

    if (this.data.object.pages.length > 4) {
      overlayClass.push('list-overlay');
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
      <div class="page-list-container">
        <div class="page-list-scroller">
          <uprtcl-list id="pages-list" class="page-list">
            ${this.data.object.pages.map((pageId, pageIndex) => {
              return html`<app-nav-page-item
                ?selected=${this.selectedId === pageId ? true : false}
                uref=${pageId}
                ui-parent=${this.uref}
                idx=${pageIndex}
                .deleteCurrentPerspective=${() =>
                  this.deletePerspective(pageId)}
              ></app-nav-page-item>`;
            })}
          </uprtcl-list>
        </div>
        <div class=${overlayClass.join(' ')}></div>
      </div>`;
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

        .page-list-container {
          position: relative;
          /* SAME AS scroller and condition for overlay in the render function!!! */
          max-height: ${css`
            ${sectionHeight}px
          `};
          overflow: hidden;
        }
        .page-list-scroller {
          max-height: ${css`
            ${sectionHeight}px
          `};
          overflow-y: auto;
        }
        .list-overlay {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0px;
          left: 0px;
          pointer-events: none;
          background-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 1),
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0)
          );
        }

        .page-list-scroller::-webkit-scrollbar {
          width: 0px;
          display: block;
          scrollbar-width: 0px; /* Firefox */
          overflow-y: scroll;
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
          height: 30px;
          margin-bottom: 6px;
        }
        .add-page-button {
          margin-left: 1.5rem;
          display: flex;
        }
      `,
    ];
  }
}
