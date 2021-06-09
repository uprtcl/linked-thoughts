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
          ? html`<uprtcl-popper skinny position="bottom-left">
              <uprtcl-icon-button icon="fork" slot="icon" button skinny
                >${this.forks.length}
              </uprtcl-icon-button>
              <uprtcl-card
                >Fork ids:
                ${this.forks.map(
                  (e) => html`<li>${e.childId} on ${e.parentId}</li>`
                )}
              </uprtcl-card>
            </uprtcl-popper>`
          : ``
      }
      <uprtcl-popper skinny icon="menu" position="bottom-left">
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
          padding: 0 5px;
          display: flex;
        }
      `,
    ];
  }
}
