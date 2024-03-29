import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { EveesHttp } from '@uprtcl/evees-http';
import {
  HttpMultiConnection,
  HttpAuth0Connection,
  HttpEthConnection,
} from '@uprtcl/http-provider';

import { DocumentsModule } from '@uprtcl/documents';
import { EveesContentModule } from '@uprtcl/evees';
import {
  initDefault,
  MultiContainer,
  RemoteExploreCachedOnMemoryWithUI,
} from '@uprtcl/evees-ui';

import { appElementsInit } from './app.elements.init';
import {
  AppHomePattern,
  DashboardPattern,
  SectionPattern,
  ThoughtsTextNodePattern,
} from './app.elements.patterns';
import { AppManager } from './app.manager';
import { env } from './env';
import { ORIGIN } from '../router/routes.builder';

export const APP_MANAGER = 'app-manager-service';

export const AUTH0_CONNECTION = 'AUTH0_CONNECTION';
export const ETH_ACCOUNT_CONNECTION = 'ETH_HTTP_CONNECTION';

export const initUprtcl = async () => {
  const host = env.host;

  const httpCidConfig: any = {
    version: 1,
    type: 'sha3-256',
    codec: 'raw',
    base: 'base58btc',
  };

  const auth0Config: Auth0ClientOptions = {
    domain: 'linked-thoughts-dev.eu.auth0.com',
    client_id: 'I7cwQfbSOm9zzU29Lt0Z3TjQsdB6GVEf',
    redirect_uri: `${ORIGIN}/home`,
    cacheLocation: 'localstorage',
  };

  const auth0HttpConnection = new HttpAuth0Connection(host, auth0Config);
  const ethHttpConnection = new HttpEthConnection(host);

  const connections = new Map();
  connections.set(AUTH0_CONNECTION, auth0HttpConnection);
  connections.set(ETH_ACCOUNT_CONNECTION, ethHttpConnection);

  /** use ETH connection only if its already logged */
  const isLoggedEth = await ethHttpConnection.isLogged();
  const connectionId = isLoggedEth ? ETH_ACCOUNT_CONNECTION : AUTH0_CONNECTION;

  const httpConnection = new HttpMultiConnection(
    host,
    connections,
    connectionId
  );

  const httpEvees = new RemoteExploreCachedOnMemoryWithUI(
    new EveesHttp(httpConnection)
  );
  const clientRemotes = [httpEvees];

  const modules = new Map<string, EveesContentModule>();
  modules.set(DocumentsModule.id, new DocumentsModule());

  const appPatterns = [
    new AppHomePattern(),
    new DashboardPattern(),
    new SectionPattern(),
    new ThoughtsTextNodePattern(),
  ];

  const evees = initDefault(clientRemotes, undefined, modules, appPatterns);

  const services = new Map<string, any>();
  const appManager = new AppManager(evees, appElementsInit);
  services.set(APP_MANAGER, appManager);

  customElements.define('app-container', MultiContainer(evees, services));
};
