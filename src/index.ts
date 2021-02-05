import { initUprtcl } from './services/init';
import { App } from './app';
import ShareCard from './containers/share';
import { DashboardElement } from './containers/dashboard';
import { NavSectionElement } from './containers/NavBar/nav.section';
import { PageItemElement } from './containers/NavBar/nav.page.item';
import { GettingStartedElement } from './containers/getting-started';
import { SectionPage } from './containers/SectionPage/section.page';
import { VisitorElement } from './containers/visitor';
import { DocumentPage } from './containers/DocPage/doc.page';

(async function () {
  await initUprtcl();

  customElements.define('intercreativity-app', App);
  customElements.define('share-card', ShareCard);
  customElements.define('app-dashboard', DashboardElement);
  customElements.define('app-nav-section', NavSectionElement);
  customElements.define('app-nav-page-item', PageItemElement);
  customElements.define('app-getting-started', GettingStartedElement);
  customElements.define('app-visitor', VisitorElement);
  customElements.define('app-section-page', SectionPage);
  customElements.define('app-document-page', DocumentPage);
})();
