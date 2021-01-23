import { html, css, internalProperty } from 'lit-element';
import { LitElement, property } from 'lit-element';

import { Entity, eveesConnect } from '@uprtcl/evees';
import { MenuConfig } from '@uprtcl/common-ui';
import { TextNode } from '@uprtcl/documents';
import { Router } from '@vaadin/router';

import { GenerateDocumentRoute } from '../../utils/routes.helpers';

export class PageItemElement extends eveesConnect(LitElement) {
  @property()
  uref: string;

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

    const empty = this.title === '';
    // TODO: const selected = this.selectedPageIx === ix;

    let classes: string[] = [];

    classes.push('page-item');
    if (empty) classes.push('title-empty');
    // if (selected) classes.push('title-selected');

    const titleStr = this.title ? this.title : 'empty';

    return html`
      <div class="page-item-row">
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
        </div>
        ${this.draggingOver
          ? html`<div class="title-dragging-over"></div>`
          : ''}
      </div>
    `;
  }
}
