import { html, css, internalProperty, property } from 'lit-element';
import lodash from 'lodash';
import { EveesBaseElement } from '@uprtcl/evees';
import { styles } from '@uprtcl/common-ui';
import { Router } from '@vaadin/router';

import { LTRouter } from '../../router';
import { sharedStyles } from '../../styles';
import { GenerateSectionRoute } from '../../utils/routes.helpers';
import { Section } from '../types';

import PlusSquareIcon from '../../assets/icons/plus-square.svg';
import { TextNode, TextType } from '@uprtcl/documents';

export class NavSectionElement extends EveesBaseElement<Section> {
  @property({ type: String })
  uref: string;

  @property({ type: Number })
  idx: number = 0;

  @internalProperty()
  selectedId: string;

  connectedCallback() {
    super.connectedCallback();
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
    const page: TextNode = {
      text: '',
      type: TextType.Title,
      links: [],
    };
    await this.evees.addNewChild(page, this.uref);

    await this.evees.client.flush();
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
      <uprtcl-list>
        ${this.data.object.pages.map((pageId, pageIndex) => {
          return html`<app-nav-page-item
            ?selected=${this.selectedId === pageId ? true : false}
            uref=${pageId}
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
        .section-heading {
          font-size: 1.2rem;
          text-transform: uppercase;
          font-weight: 600;
          color: grey;
          padding-left: 2rem;
          padding-bottom: 0.3rem;
          padding-top: 0.3rem;
          display: flex;
        }
        .add-page-button {
          margin-left: 1.5rem;
        }
      `,
    ];
  }
}
