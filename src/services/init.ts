import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { EveesHttp, HttpStore } from '@uprtcl/evees-http';
import {
  HttpMultiConnection,
  HttpAuth0Connection,
  HttpEthConnection,
} from '@uprtcl/http-provider';

import { DocumentsModule } from '@uprtcl/documents';
import {
  EveesContentModule,
  eveesConstructorHelper,
  MultiContainer,
} from '@uprtcl/evees';

import { appElementsInit } from './app.elements.init';
import {
  AppHomePattern,
  DashboardPattern,
  SectionPattern,
} from './app.elements.patterns';
import { AppManager } from './app.manager';

export const APP_MANAGER = 'app-manager-service';
export const AUTH0_CONNECTION = 'AUTH0_CONNECTION';
export const ETH_ACCOUNT_CONNECTION = 'ETH_HTTP_CONNECTION';

export const initUprtcl = async () => {
  const c1host = 'http://localhost:3100/uprtcl/1';

  const httpCidConfig: any = {
    version: 1,
    type: 'sha3-256',
    codec: 'raw',
    base: 'base58btc',
  };

  const auth0Config: Auth0ClientOptions = {
    domain: 'linked-thoughts-dev.eu.auth0.com',
    client_id: 'I7cwQfbSOm9zzU29Lt0Z3TjQsdB6GVEf',
    redirect_uri: `${window.location.origin}/homeBLYAT`,
    cacheLocation: 'localstorage',
  };

  const auth0HttpConnection = new HttpAuth0Connection(c1host, auth0Config);
  const ethHttpConnection = new HttpEthConnection(c1host);

  const connections = new Map();
  connections.set(AUTH0_CONNECTION, auth0HttpConnection);
  connections.set(ETH_ACCOUNT_CONNECTION, ethHttpConnection);

  /** use ETH connection only if its already logged */
  const isLoggedEth = await ethHttpConnection.isLogged();
  const connectionId = isLoggedEth ? ETH_ACCOUNT_CONNECTION : AUTH0_CONNECTION;

  const httpConnection = new HttpMultiConnection(
    c1host,
    connections,
    connectionId
  );

  const httpStore = new HttpStore(httpConnection, httpCidConfig);
  const httpEvees = new EveesHttp(httpConnection, httpStore);

  const remotes = [httpEvees];
  const modules = new Map<string, EveesContentModule>();
  modules.set(DocumentsModule.id, new DocumentsModule());

  const appPatterns = [
    new AppHomePattern(),
    new DashboardPattern(),
    new SectionPattern(),
  ];

  const evees = eveesConstructorHelper(remotes, modules, appPatterns);

  const services = new Map<string, any>();
  const appManager = new AppManager(evees, appElementsInit);
  services.set(APP_MANAGER, appManager);

  customElements.define('app-container', MultiContainer(evees, services));
};
