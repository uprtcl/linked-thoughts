/** The name used by the Vaading Router */
export enum RouteName {
  getting_started = 'getting-started',
  dashboard = 'dashboard',
  dashboard_page = 'page',
  dashboard_section = 'section',
  user_blog = 'blog',
  user_blog_page = 'blog_page',
  test = 'test',
  icons = 'icons',
  error = 'error',
}

/** the string shown in the url */
export enum RouteBase {
  home = '/',
  dashboard_page = '/page',
  dashboard_section = '/section',
  getting_started = '/getting-started',
  read_page = '/read',
  user_blog = '/blog',
  test = '/test',
  icons = '/icons',
  error = '/error',
}

export const ROUTER_GO_EVENT = 'router-go';

export interface RouteParams {
  pageId?: string;
  sectionId?: string;
  userId?: string;
}

export interface RouteLocation {
  name: RouteName;
  params?: RouteParams;
}
export class RouterGoEvent extends CustomEvent<RouteLocation> {
  constructor(location: RouteLocation) {
    super(ROUTER_GO_EVENT, { bubbles: true, composed: true, detail: location });
  }
}
