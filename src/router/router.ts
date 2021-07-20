import { Router } from '@vaadin/router';
import { SetLastVisited } from '../utils/localStorage';
import { RouteName, RouteBase } from './routes.types';
import {
  GenerateDocumentRoute,
  GenerateReadDocumentRoute,
  GenerateSectionRoute,
  GenerateUserRoute,
} from './routes.builder';

/** components are dummy DIVs because rendering is manually done on the app.ts file. Router is used
 * to parse and manipulate the browser location */
export class LTRouter {
  router: Router;

  async setupRouter(outlet: HTMLElement) {
    this.router = new Router(outlet);

    this.router.setRoutes([
      {
        path: RouteBase.home,
        component: 'div', // Slot
        children: [
          {
            name: RouteName.dashboard,
            path: '/',
            component: 'div',
          },
          {
            name: RouteName.dashboard_page,
            path: GenerateDocumentRoute(),
            component: 'div',
            action: (context) => {
              SetLastVisited(
                context.route.name,
                context.params.pageId as string
              );
            },
          },
          {
            name: RouteName.dashboard_section,
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
      {
        path: RouteBase.test,
        name: RouteName.test,
        component: 'div',
      },
      {
        path: RouteBase.icons,
        name: RouteName.icons,
        component: 'div',
      },
      {
        path: RouteBase.getting_started,
        name: RouteName.getting_started,
        component: 'div',
      },
      {
        path: GenerateReadDocumentRoute(),
        component: 'div',
      },
      {
        path: GenerateUserRoute(),
        component: 'div',
        children: [{ path: '/:pageId', component: 'div' }],
      },
      { path: '(.*)', component: 'app-error-page' },
    ]);

    await this.router.ready;
  }
}
