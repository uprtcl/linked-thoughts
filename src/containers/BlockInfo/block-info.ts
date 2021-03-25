import { html, css, property } from 'lit-element';
import { styles } from '@uprtcl/common-ui';
import { Logger, Perspective, Secured } from '@uprtcl/evees';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';

export class BlockInfoPopper extends ConnectedElement {
  logger = new Logger('DocPage');

  @property({ type: String })
  uref: string;

  forksSection!: Secured<Perspective>;

  async firstUpdated() {
    this.forksSection = await this.appManager.elements.get(
      '/linkedThoughts/forksSection'
    );
  }

  async forkBlock() {
    await this.appManager.forkPage(this.uref, this.forksSection.id, true);
  }

  render() {
    return html`
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
        }
      `,
    ];
  }
}
