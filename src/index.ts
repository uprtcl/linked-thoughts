import { initUprtcl } from './init';
import { App } from './app';
import ShareCard from './containers/share';
import { DashboardElement } from './containers/wikidrawer/dashboard';
import { GettingStartedElement } from './containers/wikidrawer/getting-started';

(async function () {
  await initUprtcl();

  customElements.define('intercreativity-app', App);
  customElements.define('share-card', ShareCard);
  customElements.define('app-dashboard', DashboardElement);
  customElements.define('app-getting-started', GettingStartedElement);
})();
