import { html, css, internalProperty, property } from 'lit-element';

import { icons, MenuOptions, styles } from '@uprtcl/common-ui';
import { EveesBaseElement } from '@uprtcl/evees-ui';
import { TextNode } from '@uprtcl/documents';

import { RouteName, RouterGoEvent } from '../../router/routes.types';

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

  connectedCallback() {
    super.connectedCallback();
  }

  async firstUpdated() {
    await super.firstUpdated();

    if (this.guardianId !== this.uiParentId) {
      this.isShortcut = true;
    }
  }

  async dataUpdated() {
    this.title = this.localEvees.behaviorFirst(this.data.object, 'title');
  }

  selectPage() {
    // Change the Page Title
    // window.document.title = this.title + ' | Linked Thoughts';
    this.dispatchEvent(
      new RouterGoEvent({
        name: RouteName.dashboard_page,
        params: { pageId: this.uref },
      })
    );
  }

  async optionOnPage(e) {
    switch (e.detail.key) {
      case 'remove':
        this.dispatchEvent(
          new CustomEvent('delete-element', { detail: this.uref })
        );
        break;
    }
  }

  deriveTitle(title) {
    const MAX_TITLE_LENGTH = 20;
    return title.length > MAX_TITLE_LENGTH
      ? title.substr(0, MAX_TITLE_LENGTH) + '...'
      : title;
  }

  render() {
    const menuConfig: MenuOptions = new Map();
    menuConfig.set('remove', {
      disabled: false,
      text: 'delete',
      icon: 'delete',
    });

    let classes: string[] = [];

    classes.push('page-item-row clickable');
    if (this.selected) {
      classes.push('selected-item');
    }
    const titleStr = this.title ? this.title : 'Untitled';

    return html`
      <div
        class=${classes.join(' ')}
        @click=${() => this.selectPage()}
        title=${titleStr}
      >
        ${this.isShortcut
          ? html`<div class="item-icon-container">${icons.link}</div>`
          : ''}
        <span class="text-container">${this.deriveTitle(titleStr)}</span>

        <span class="item-menu-container">
          <uprtcl-options-menu
            class="options-menu"
            @option-click=${this.optionOnPage}
            .config=${menuConfig}
            skinny
            secondary
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
