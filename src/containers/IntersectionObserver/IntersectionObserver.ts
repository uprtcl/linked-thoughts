import { LitElement, html, css, property, query } from 'lit-element';

export default class LTIntersectionObserver extends LitElement {
  constructor() {
    super();
  }
  @property({ type: Array })
  thresholds;

  @property({ type: String })
  rootMargin;

  observer: IntersectionObserver = null;
  isShown: boolean = false;

  render() {
    return html` <div id="slottedData"></div> `;
  }

  firstUpdated() {
    // super.firstUpdated();
    this.observer = new IntersectionObserver(
      this.handleIntersectionCallback.bind(this),
      {
        rootMargin: this.rootMargin || '0px',
        threshold: this.thresholds || [0.0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    this.observer.observe(this.shadowRoot.querySelector('#slottedData'));
  }

  handleIntersectionCallback(entries) {
    for (let entry of entries) {
      this._setIntersect(entry);
    }
  }

  _setIntersect(entry) {
    let event = new CustomEvent('intersect', {
      detail: {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: Number(entry.intersectionRatio).toFixed(2) || '0.00',
      },
    });

    if (entry.intersectionRatio > 0) {
      console.log('intersect shown');
      this.isShown = true;
    }

    if (!entry.isIntersecting && entry.intersectionRatio == 0) {
      console.log('intersect hidden');
      this.isShown = false;
    }

    this.dispatchEvent(event);
  }

  static get styles() {
    return [
      css`
        #slottedData {
          height: 1px;
          margin-bottom: 10vh;
          /* background: #f0f; */
        }
      `,
    ];
  }
}
