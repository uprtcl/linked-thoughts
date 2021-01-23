import { Router } from '@vaadin/router';
import * as Routes from './constants/routeNames';
import {
  GenerateDocumentRoute,
  GenerateSectionRoute,
} from './utils/routes.helpers';

export class LTRouter {
  static Router: Router;

  static setupRouter(outlet: HTMLElement) {
    const router = new Router(outlet);

    router.setRoutes([
      {
        path: Routes.GettingStarted,
        component: 'app-getting-started',
      },
      {
        path: Routes.Home,
        component: 'app-dashboard', // Slot
        children: [
          {
            path: '/',
            component: 'div',
          },
          {
            path: GenerateDocumentRoute(),
            component: 'div',
          },
          {
            path: GenerateSectionRoute(),
            component: 'div',
          },
        ],
      },
    ]);

    this.Router = router;

    return router;
  }
}

export const LTRouterInstance = new LTRouter();
