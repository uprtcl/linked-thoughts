import { Logger } from '@uprtcl/evees';
import { LitElement, html, css, property, query } from 'lit-element';

export default class UprtclIsVisible extends LitElement {
  logger = new Logger('UprtclIsVisible');

  @property({ type: Boolean })
  enable: boolean = false;

  @query('#element')
  element: HTMLElement;

  observer: IntersectionObserver = null;
  isShown: boolean = false;

  render() {
    return this.enable ? html` <div id="element"></div> ` : '';
  }

  async updated(changedProperties) {
    if (changedProperties.has('enable')) {
      if (this.enable) {
        this.observer.observe(this.element);
      } else {
        this.isShown = false;
      }
    }
  }

  firstUpdated() {
    // super.firstUpdated();
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersectionCallback(entries),
      {
        rootMargin: '0px',
        threshold: [0.0, 0.5],
      }
    );
  }

  handleIntersectionCallback(entries) {
    for (let entry of entries) {
      this.handleIntersect(entry);
    }
  }

  handleIntersect(entry) {
    // this.logger.log('handleIntersect', entry);

    const wasVisible = this.isShown;

    if (entry.intersectionRatio > 0) {
      this.logger.log('intersect shown');
      this.isShown = true;
    }

    if (entry.intersectionRatio == 0) {
      this.logger.log('intersect hidden');
      this.isShown = false;
    }

    /** emit only on changes */
    if (this.enable && wasVisible !== this.isShown) {
      this.dispatchEvent(
        new CustomEvent('visible-changed', {
          bubbles: true,
          composed: true,
          detail: { value: this.isShown },
        })
      );
    }
  }

  static get styles() {
    return [
      css`
        #element {
          height: 1px;
          /* background: #f0f; */
          margin-bottom: 5vh;
        }
      `,
    ];
  }
}
