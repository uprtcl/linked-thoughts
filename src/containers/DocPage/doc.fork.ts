import { html, css, internalProperty, property, query } from 'lit-element';
import { styles } from '@uprtcl/common-ui';
import {
  Secured,
  Perspective,
  Evees,
  RecursiveContextMergeStrategy,
} from '@uprtcl/evees';
import { DocumentEditor } from '@uprtcl/documents';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

import RestrictedIcon from '../../assets/icons/left.svg';
import CloseIcon from '../../assets/icons/x.svg';
import MoreHorizontalIcon from '../../assets/icons/more-horizontal.svg';

export class DocumentPageForkSection extends ConnectedElement {
  @property({ type: String, attribute: 'page-id' })
  pageId: string;

  @internalProperty()
  loading = true;

  async firstUpdated() {
    this.load();
  }

  async load() {
    this.loading = false;
  }

  render() {
    if (this.loading) return html`<uprtcl-loading></uprtcl-loading>`;

    return html` <div>Hello</div> `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          width: 100%;
          height: 200px;
          background: #f0f;
          border: 2px solid #00f;
        }
      `,
    ];
  }
}
