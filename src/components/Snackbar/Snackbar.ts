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

export class Snackbar extends ConnectedElement {
  @internalProperty()
  showSnackBar = true;

  @property({ type: Number })
  autoCloseDelay = 5000;

  closeTimer;
  async firstUpdated() {
    if (this.closeTimer != null) {
      clearTimeout(this.closeTimer);
    }
    if (this.autoCloseDelay) {
      this.closeTimer = setTimeout(() => {
        this.showSnackBar = false;
      }, this.autoCloseDelay);
    }
  }

  render() {
    if (!this.showSnackBar) return null;
    return html`<div class="snackbar-cont">
      <div class="snackbar">
        <slot name="description" class="snackbar-content"></slot>
        <slot name="action" class="snackbar-action"></slot>
        <div
          class="snackbar-action"
          @click=${() => {
            this.showSnackBar = false;
          }}
        >
          ${CloseIcon}
        </div>
      </div>
    </div>`;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
      
      
        .snackbar-cont {
          font-family: 'Inter', sans-serif;
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #262641;
          box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.15),
            0px 4px 8px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          animation: slideUp 0.7s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .snackbar-hide {
          animation: slideDown 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes slideUp {
          0% {
            bottom: -5%;
            opacity: 0.3;
          }
          100% {
            bottom: 10%;
            opacity: 1;
          }
        }
        @keyframes slideDown {
          to {
            bottom: 0%;
          }
        }
        .snackbar {
          display: flex;
          justify-content: center;
          align-items: center;
          padding-left: 1rem;
          color: #fafcfe;
        }
        .snackbar > * {
          padding: 0.5rem;
        }
        .snackbar-action {
          padding: 0.5rem 1rem;
          border-left: 1px solid #fff6;
          cursor: pointer;
          transition: all 0.2s ease;
          align-items: center;
          justify-content: center;
          display: flex;
          font-weight: bold;
        }
        .snackbar-action:hover {
          background: #fff3;
        }
      `,
    ];
  }
}