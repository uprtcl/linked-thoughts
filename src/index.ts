import { initUprtcl } from './init';
import { App } from './app';
import ShareCard from './containers/share';
import { DashboardElement } from './containers/wikidrawer/dashboard';

(async function () {
  await initUprtcl();

  customElements.define('intercreativity-app', App);
  customElements.define('share-card', ShareCard);
  customElements.define('app-dashboard', DashboardElement);
})();
