import { html, css, internalProperty, property } from 'lit-element';
import { Router } from '@vaadin/router';

import { MenuConfig, styles } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees';
import { TextNode } from '@uprtcl/documents';

import { GenerateDocumentRoute } from '../../utils/routes.helpers';

import ShortcutIcon from '../../assets/icons/shortcut.svg';
import { sharedStyles } from '../../styles';

export class PageItemElement extends EveesBaseElement<TextNode> {
  @property({ type: Boolean })
  selected: boolean = false;

  @property({ type: Number })
  idx: number = null;

  @internalProperty()
  draggingOver = false;

  @internalProperty()
  title: string = '';

  @internalProperty()
  isShortcut: boolean = false;

  deleteCurrentPerspective: Function = () => null;

  async firstUpdated() {
    await super.firstUpdated();
    if (this.guardianId !== this.uiParentId) {
      this.isShortcut = true;
    }
  }

  async dataUpdated() {
    this.title = this.evees.behavior(this.data.object, 'title');
  }

  selectPage() {
    // Change the Page Title
    // window.document.title = this.title + ' | Linked Thoughts';
    Router.go(GenerateDocumentRoute(this.uref));
  }

  async optionOnPage(e) {
    switch (e.detail.key) {
      case 'remove':
        this.deleteCurrentPerspective();
        break;
    }
  }

  render() {
    const menuConfig: MenuConfig = {
      remove: {
        disabled: false,
        text: 'remove',
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
        ${this.isShortcut
          ? html`<div class="item-icon-container">${ShortcutIcon}</div>`
          : ''}
        <span class="text-container">${titleStr}</span>

        <span class="item-menu-container">
          <uprtcl-options-menu
            class="options-menu"
            @option-click=${this.optionOnPage}
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
        .item-icon-container svg {
          height: 12px;
          margin-right: 6px;
        }
        .text-container {
          flex: 1;
        }
      `,
    ];
  }
}
