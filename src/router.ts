import { Router } from '@vaadin/router';
import * as Routes from './constants/routeNames';
import { SetLastVisited } from './utils/localStorage';
import {
  GenerateDocumentRoute,
  GenerateReadDocumentRoute,
  GenerateSectionRoute,
  GenerateUserRoute,
  RouteName,
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
        path: GenerateReadDocumentRoute(),
        component: 'app-visitor',
      },
      {
        path: GenerateUserRoute(),
        component: 'app-user-page',
      },
      {
        path: Routes.Home,
        component: 'app-dashboard', // Slot
        children: [
          {
            name: RouteName.dashboard,
            path: '/',
            component: 'div',
          },
          {
            name: RouteName.page,
            path: GenerateDocumentRoute(),
            component: 'div',
            action: (context) => {
              SetLastVisited(
                context.route.name,
                context.params.docId as string
              );
            },
          },
          {
            name: RouteName.section,
            path: GenerateSectionRoute(),
            component: 'div',
            action: (context) => {
              SetLastVisited(
                context.route.name,
                context.params.sectionId as string
              );
            },
          },
        ],
      },
      { path: '(.*)', component: 'app-error-page' },
    ]);

    this.Router = router;

    return router;
  }
}

export const LTRouterInstance = new LTRouter();
