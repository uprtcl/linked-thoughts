import { Router } from '@vaadin/router';
import * as Routes from './constants/routeNames';
export function setupRouter(outlet: HTMLElement) {
  const router = new Router(outlet);

  router.setRoutes([
    {
      path: Routes.Home,
      component: 'app-dashboard',
    },
    {
      path: Routes.GettingStarted,
      component: 'app-getting-started',
    },
  ]);

  return router;
}
