import { Router } from '@vaadin/router';

export function setupRouter(outlet: HTMLElement) {
  const router = new Router(outlet);

  router.setRoutes([
    {
      path: '/',
      component: 'app-dashboard',
    },
    {
      path: '/landing',
      component: 'app-landing',
    },
  ]);

  return router;
}
