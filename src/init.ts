import { Auth0ClientOptions } from '@auth0/auth0-spa-js';

import { EveesHttp } from '@uprtcl/evees-http';
import { HttpStore, HttpAuth0Provider } from '@uprtcl/http-provider';

import { eveesLoader } from '@uprtcl/evees';
import { DocumentsModule } from '@uprtcl/documents';
import { WikisModule } from '@uprtcl/wikis';

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

  const httpProvider = new HttpAuth0Provider(
    { host: c1host, apiId: 'evees-v1' },
    auth0Config
  );
  const httpStore = new HttpStore(httpProvider, httpCidConfig);
  const httpEvees = new EveesHttp(httpProvider, httpStore);

  const documents = new DocumentsModule();
  const wikis = new WikisModule();

  const remotes = [httpEvees];
  const stores = [httpStore];
  const modules = [documents, wikis];

  eveesLoader(remotes, stores, modules);
};
