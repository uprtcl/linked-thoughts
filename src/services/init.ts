import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { EveesHttp, HttpStore } from '@uprtcl/evees-http';
import { HttpAuth0Connection } from '@uprtcl/http-provider';

import { DocumentsModule } from '@uprtcl/documents';
import { WikisModule } from '@uprtcl/wikis';
import {
  EveesContentModule,
  eveesConstructorHelper,
  AppElements,
  MultiContainer,
} from '@uprtcl/evees';

import { appElementsInit } from './app.elements.init';

export const EVEES = 'evees-service';
export const APP_ELEMENTS = 'app-elements-service';

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

  const httpConnection = new HttpAuth0Connection(c1host, auth0Config);
  await httpConnection.ready();

  const httpStore = new HttpStore(httpConnection, httpCidConfig);
  const httpEvees = new EveesHttp(httpConnection, httpStore);

  const remotes = [httpEvees];
  const modules = new Map<string, EveesContentModule>();
  modules.set(DocumentsModule.id, new DocumentsModule());
  modules.set(WikisModule.id, new WikisModule());

  const evees = eveesConstructorHelper(remotes, modules);
  const appElements = new AppElements(evees, appElementsInit);

  const services = new Map<string, any>();
  services.set(EVEES, evees);
  services.set(APP_ELEMENTS, appElements);

  customElements.define('app-container', MultiContainer(services));
};
