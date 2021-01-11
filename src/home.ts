import { LitElement, html, css, property, query } from 'lit-element';
import { ApolloClient } from 'apollo-boost';

import { htmlToText, TextType, TextNode } from '@uprtcl/documents';
import { moduleConnect } from '@uprtcl/micro-orchestrator';
import {
  EveesModule,
  EveesRemote,
  EveesHelpers,
  deriveEntity,
  Perspective,
} from '@uprtcl/evees';

import { EveesHttp } from '@uprtcl/evees-http';
import { ApolloClientModule } from '@uprtcl/graphql';

import { Router } from '@vaadin/router';

export class Home extends moduleConnect(LitElement) {
  @property({ attribute: false })
  loadingSpaces: boolean = true;

  @property({ attribute: false })
  loadingHome: boolean = true;

  @property({ attribute: false })
  creatingNewDocument: boolean = false;

  @property({ attribute: false })
  removingSpace: boolean = false;

  @property({ attribute: false })
  switchNetwork: boolean = false;

  @property({ attribute: false })
  home: string | undefined = undefined;

  @property({ attribute: false })
  showNewSpaceForm: boolean = false;

  spaces!: object;

  client: ApolloClient<any>;
  remote: any;

  async firstUpdated() {
    const eveesProvider = this.requestAll(
      EveesModule.bindings.EveesRemote
    ).find((provider: EveesHttp) =>
      provider.id.startsWith('http')
    ) as EveesHttp;

    await eveesProvider.login();

    this.client = await this.request(ApolloClientModule.bindings.Client);

    this.remote = (await this.requestAll(
      EveesModule.bindings.EveesRemote
    ).find((provider: EveesRemote) =>
      provider.id.startsWith('http')
    )) as EveesHttp;

    const perspective = await this.remote.getHome(this.remote.userId);

    try {
      await EveesHelpers.getPerspectiveData(this.client, perspective.id);
      this.go(perspective.id);
    } catch (err) {
      this.loadingHome = false;
      console.log('New user.');
    }
  }

  async newDocument(title: string) {
    // alert('Lol');
    this.creatingNewDocument = true;

    // const client: ApolloClient<any> = this.request(
    //   ApolloClientModule.bindings.Client
    // );

    // const remote = this.requestAll(
    //   EveesModule.bindings.EveesRemote
    // ).find((provider: EveesRemote) =>
    //   provider.id.startsWith('http')
    // ) as EveesHttp;

    // const id = await EveesHelpers.createPerspective(client, remote, {
    //   context: perspective.object.payload.context,
    //   timestamp: perspective.object.payload.timestamp,
    //   creatorId: perspective.object.payload.creatorId,
    // });

    // if (id !== perspective.id) {
    //   throw new Error('unexpected id');
    // }

    // await remote.flush();
    // this.go(perspective.id);

    // Raw Code

    const client: ApolloClient<any> = this.request(
      ApolloClientModule.bindings.Client
    );

    const remote = this.requestAll(
      EveesModule.bindings.EveesRemote
    ).find((provider: EveesRemote) =>
      provider.id.startsWith('http')
    ) as EveesHttp;

    const perspective = await remote.getHome(remote.userId);

    let homePerspectiveExist: boolean;

    try {
      await EveesHelpers.getPerspectiveData(this.client, perspective.id);
      homePerspectiveExist = true;
    } catch (err) {
      homePerspectiveExist = false;
    }

    if (!homePerspectiveExist) {
      await EveesHelpers.createPerspective(client, remote, {
        context: perspective.object.payload.context,
        timestamp: perspective.object.payload.timestamp,
        creatorId: perspective.object.payload.creatorId,
      });
    }

    const linkedThoughtsPerspectiveObject: Perspective = {
      remote: remote.id,
      path: remote.defaultPath,
      context: 'linked-thoughts.dashboard',
      timestamp: 0,
      creatorId: remote.userId,
    };
    debugger;
    const linkedThoughtsPerspectiveEntity = await EveesHelpers.snapDefaultPerspective(
      remote,
      linkedThoughtsPerspectiveObject.creatorId,
      linkedThoughtsPerspectiveObject.context,
      linkedThoughtsPerspectiveObject.timestamp
    );
    let linkedThoughtsPerspectiveExist: boolean;
    try {
      await EveesHelpers.getPerspectiveData(
        this.client,
        linkedThoughtsPerspectiveEntity.id
      );
      linkedThoughtsPerspectiveExist = true;
    } catch (err) {
      linkedThoughtsPerspectiveExist = false;
    }

    let linkedThoughtsPerspectiveID;
    if (!linkedThoughtsPerspectiveExist) {
      linkedThoughtsPerspectiveID = await EveesHelpers.createPerspective(
        client,
        remote,
        {
          context: linkedThoughtsPerspectiveObject.context,
          timestamp: linkedThoughtsPerspectiveObject.timestamp,
          creatorId: linkedThoughtsPerspectiveObject.creatorId,
        }
      );
    }
    debugger;
    // we know home and LT dashboard "folders"/perspectives exists
    const privateFolder = await EveesHelpers.createPerspective(client, remote, {
      parentId: linkedThoughtsPerspectiveEntity.id,
    });
    const page1Id = await EveesHelpers.createPerspective(client, remote, {
      parentId: privateFolder,
    });

    const newPageObject: TextNode = {
      text: '',
      type: TextType.Title,
      links: [],
    };

    await EveesHelpers.updateHeadWithData(
      client,
      remote.store,
      page1Id,
      newPageObject
    );

    const privateFolderObject: TextNode = {
      text: 'Private',
      type: TextType.Title,
      links: [page1Id],
    };
    // at this point private folder is ready, now lets prepare the blog folder

    await EveesHelpers.updateHeadWithData(
      client,
      remote.store,
      privateFolder,
      privateFolderObject
    );

    const blogFolder = await EveesHelpers.createPerspective(client, remote, {
      parentId: linkedThoughtsPerspectiveEntity.id,
    });

    // we need to make the blog public.
    // await remote.accessControl.set(blogFolder.id, {
    //   publicRead: true,
    //   publicWrite: false,
    //   delegate: false,
    //   // delegateTo
    // });

    // at this point, the blog and private "folders" exist : LinkedThoughtDashboard
    const dashboardInitObject = {
      text: '',
      type: TextType.Title,
      links: [privateFolder, blogFolder],
    };

    await EveesHelpers.updateHeadWithData(
      client,
      remote.store,
      linkedThoughtsPerspectiveEntity.id,
      dashboardInitObject
    );

    await remote.flush();
    this.go(perspective.id);
    //
    // at this point we ready, we created 3 folders
    /** - home (publicRead = false)
     *  |--> linkedThoughts  (delegate ACL to home)
     *    |--> privateSection  (delegate ACL to linkedThoughts)
     *    |  |--> page1  (delegate ACL to privateSection)
     *    |--> blog (custom ACL publicRead = true, publicWrite = false)
     */

    // when we are wokring with the app
    // share to blog -> add page1 as child of blog, change ACL of page1 to delegateTo (inheritFrom) blog instead of private section.
  }

  go(perspectiveId: string) {
    Router.go(`/doc/${perspectiveId}`);
  }

  render() {
    if (this.switchNetwork) {
      return html` Please make sure you are connected to Rinkeby network `;
    }

    return html`
      ${this.loadingHome
        ? html`<uprtcl-loading></uprtcl-loading>`
        : !this.showNewSpaceForm
        ? html`
            <img class="background-image" src="/img/home-bg.svg" />
            <div class="button-container">
              <uprtcl-button
                @click=${() => (this.showNewSpaceForm = true)}
                raised
              >
                create your space
              </uprtcl-button>
            </div>
          `
        : html`
            <uprtcl-form-string
              value=""
              label="title (optional)"
              ?loading=${this.creatingNewDocument}
              @cancel=${() => (this.showNewSpaceForm = false)}
              @accept=${(e) => this.newDocument(e.detail.value)}
            ></uprtcl-form-string>
          `}
    `;
  }

  static styles = css`
    :host {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      text-align: center;
      height: 80vh;
      padding: 10vh 10px;
    }

    uprtcl-form-string {
      width: fit-content;
      margin: 0 auto;
    }

    uprtcl-button {
      width: 220px;
      margin: 0 auto;
    }

    .background-image {
      position: fixed;
      bottom: -71px;
      right: -67px;
      z-index: 0;
      width: 60vw;
      max-width: 600px;
      min-width: 400px;
    }

    .top-right {
      position: fixed;
      top: 6px;
      right: 6px;
      z-index: 3;
    }

    .top-right evees-popper {
      --box-width: 80vw;
    }

    .top-right evees-popper uprtcl-button {
      width: 100%;
    }
  `;
}
