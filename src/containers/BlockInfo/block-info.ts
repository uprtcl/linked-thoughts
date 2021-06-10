import { html, css, property, internalProperty } from 'lit-element';
import { styles } from '@uprtcl/common-ui';
import { Logger, ParentAndChild, Perspective, Secured } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export class BlockInfoPopper extends ConnectedElement {
  logger = new Logger('DocPage');

  @property({ type: String })
  uref: string;

  @property({ type: String })
  parentId: string;

  @internalProperty()
  forks: ParentAndChild[];

  forksSection!: Secured<Perspective>;

  async firstUpdated() {
    this.forksSection = await this.appManager.elements.get(
      '/linkedThoughts/forksSection'
    );
    this.load();
  }

  async load() {
    const forkedIn = await this.appManager.getForkedInMine(this.uref);
    this.forks = forkedIn.filter((e) => e.childId !== this.uref);
  }

  async forkBlock() {
    await this.appManager.forkPage(this.uref, this.forksSection.hash, true);
  }

  render() {
    return html`
      ${
        this.forks && this.forks.length > 0
          ? html`<div class="forks">
              <div class="number">8</div>
              <uprtcl-popper skinny position="bottom-left">
                <uprtcl-icon-button icon="fork" slot="icon" button skinny>
                </uprtcl-icon-button>
                <uprtcl-card
                  >Fork ids:
                  ${this.forks.map(
                    (e) => html`<li>${e.childId} on ${e.parentId}</li>`
                  )}
                </uprtcl-card>
              </uprtcl-popper>
            </div> `
          : ``
      }
      <uprtcl-popper skinny icon="two_dots" position="bottom-left">
        <uprtcl-card><uprtcl-button @click=${() =>
          this.forkBlock()}>Fork</uprtcl-button></uprtcl-button></uprtcl-card>
      </uprtcl-popper>
    `;
  }
  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          position: relative;
        }

        .number {
          font-family: 'Inter';
          font-weight: 500;
          font-size: 1rem;
        }

        .forks {
          position: absolute;
          margin-left: -46px;
          --svg-fill: #7d7d9250;
          --svg-height: 18px;
          color: #7d7d9250;
          display: flex;
          align-items: center;
        }
      `,
    ];
  }
}
