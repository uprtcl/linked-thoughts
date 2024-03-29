import { html, css, internalProperty, property } from 'lit-element';
import { EveesBaseElement } from '@uprtcl/evees-ui';
import { styles } from '@uprtcl/common-ui';

import { sharedStyles } from '../../styles';
import { RouteName, RouterGoEvent } from '../../router/routes.types';

import { APP_MANAGER } from '../../services/init';
import { AppManager } from '../../services/app.manager';

import { Section } from '../types';

export class NavSectionElement extends EveesBaseElement<Section> {
  @property({ type: Number })
  idx: number = 0;

  @property({ type: String, attribute: 'selected-id' })
  selectedId: string;

  @internalProperty()
  canCreate = false;

  // TODO request app mananger on an ConnectedEveeElement base class...
  appManager: AppManager;
  creatingPage: boolean = false;

  showPaddingDiv: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.appManager = this.request(APP_MANAGER);
  }

  async firstUpdated() {
    await super.firstUpdated();
    const privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.canCreate = privateSection.hash === this.uref;
  }

  async newPage(e: Event) {
    if (this.creatingPage) return;
    this.creatingPage = true;
    e.stopPropagation();
    const pageId = await this.appManager.newPage(this.uref);
    this.creatingPage = false;

    this.dispatchEvent(
      new RouterGoEvent({
        name: RouteName.dashboard_page,
        params: { pageId: pageId },
      })
    );
  }

  navigateSection() {
    this.dispatchEvent(
      new RouterGoEvent({
        name: RouteName.dashboard_section,
        params: { sectionId: this.uref },
      })
    );
  }

  async deletePage(pageIx: number) {
    const confirmResponse = window.confirm(
      'Are you sure you want to delete this item?'
    );

    if (confirmResponse === true) {
      let wasSelected: boolean = false;

      if (this.selectedId === this.data.object.pages[pageIx]) {
        wasSelected = true;
      }

      await this.evees.deleteChild(this.uref, pageIx);
      await this.evees.flush();

      if (wasSelected) {
        this.dispatchEvent(
          new RouterGoEvent({
            name: RouteName.dashboard_section,
            params: { sectionId: this.uref },
          })
        );
      }
    }
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    let classes: string[] = [];
    classes.push('section-heading clickable');
    if (this.selectedId === this.uref) {
      classes.push('selected-item');
    }

    return html`<div class=${classes.join(' ')} @click=${() =>
      this.navigateSection()}>
        <span class="section-text">${this.data.object.title}</span>
        ${
          this.canCreate
            ? html`<uprtcl-icon-button
                skinny
                secondary
                @click=${(e) => this.newPage(e)}
                icon="add_box"
              ></uprtcl-icon-button>`
            : html`<uprtcl-help position="bottom-right">
                <span>
                  To add a page on the "Blog" section, create or select a
                  Private page and then "share" it.
                </span>
              </uprtcl-help>`
        }
      </div>
      <div class="page-list-container">
        <div class="recent">RECENT:</div>
        <uprtcl-list class="page-list"></uprtcl-list>
          ${this.data.object.pages.slice(0, 3).map((pageId, pageIndex) => {
            return html`<app-nav-page-item
              ?selected=${this.selectedId === pageId ? true : false}
              uref=${pageId}
              ui-parent=${this.uref}
              idx=${pageIndex}
              @delete-element=${() => this.deletePage(pageIndex)}
            ></app-nav-page-item>`;
          })}
        </uprtcl-list>
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
          color: var(--gray-dark, black);
        }

        .recent {
          font-size: 12px;
          padding: 0px 2rem;
          font-weight: bold;
          color: rgb(204, 204, 204);
        }

        .padding-div {
          height: 55px;
        }

        .section-heading {
          font-size: 1.2rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--gray-dark, gray);
          padding: 0.3rem 0.2rem 0.3rem 2rem;
          display: flex;
          align-items: center;
          height: 30px;
          margin-bottom: 6px;
        }
        .section-text {
          flex-grow: 1;
        }
        .add-page-button {
          margin-left: 1.5rem;
          display: flex;
        }
      `,
    ];
  }
}
