import { html, css, internalProperty, LitElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { styles } from '@uprtcl/common-ui';
import { Entity, eveesConnect } from '@uprtcl/evees';
import { MenuConfig } from '@uprtcl/common-ui';
import { TextNode } from '@uprtcl/documents';
import { Router } from '@vaadin/router';

import { GenerateDocumentRoute } from '../../utils/routes.helpers';
import { sharedStyles } from '../../styles';
export class PageItemElement extends eveesConnect(LitElement) {
  @property()
  uref: string;

  @property({ type: Boolean })
  selected: boolean = false;

  @internalProperty()
  loading = true;

  @internalProperty()
  draggingOver = false;

  pageData: Entity<TextNode>;

  async firstUpdated() {
    this.loading = true;
    this.pageData = await this.evees.getPerspectiveData(this.uref);
    this.title = this.evees.behavior(this.pageData.object, 'title');
    this.loading = false;
  }

  selectPage() {
    // Change the Page Title
    // window.document.title = this.title + ' | Linked Thoughts';
    Router.go(GenerateDocumentRoute(this.uref));
  }

  async optionOnPage(option: string) {
    // switch (option) {
    //   case 'move-up':
    //     this.movePage(pageIndex, pageIndex - 1);
    //     break;
    //   case 'move-down':
    //     this.movePage(pageIndex, pageIndex + 1);
    //     break;
    //   case 'add-below':
    //     this.newPage(pageIndex + 1);
    //     break;
    //   case 'remove':
    //     this.removePage(pageIndex);
    //     break;
    // }
  }

  render() {
    const menuConfig: MenuConfig = {
      'add-below': {
        disabled: false,
        text: 'create below',
        icon: 'add',
      },
      remove: {
        disabled: false,
        text: 'Delete',
        icon: 'delete',
      },
    };

    let classes: string[] = [];

    classes.push('page-item-row clickable');
    if (this.selected) {
      classes.push('selected-item');
    }
    const titleStr = this.title ? this.title : 'Untitled';

    return html`
      <div class=${classes.join(' ')} @click=${() => this.selectPage()}>
        <span class="text-container">${titleStr}</span>

        <span class="item-menu-container">
          <uprtcl-options-menu
            class="options-menu"
            @option-click=${(e) => this.optionOnPage(e.detail.key)}
            .config=${menuConfig}
            skinny
          >
          </uprtcl-options-menu>
        </span>
        ${this.draggingOver
          ? html`<div class="title-dragging-over"></div>`
          : ''}
      </div>
    `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
        }

        .page-item-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0.1rem 0.2rem;
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
