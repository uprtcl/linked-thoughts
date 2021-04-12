import { html, css, internalProperty, query } from 'lit-element';
import { EveesHttp } from '@uprtcl/evees-http';
import { styles } from '@uprtcl/common-ui';
import { Logger } from '@uprtcl/evees';
import { HttpMultiConnection } from '@uprtcl/http-provider';

import { ConnectedElement } from '../../services/connected.element';
import { sharedStyles } from '../../styles';
import { ETH_ACCOUNT_CONNECTION } from '../../services/init';
import { Perspective } from '@uprtcl/evees';
import { Secured } from '@uprtcl/evees';
import { Section } from '../types';
import { TextNode, TextType } from '@uprtcl/documents';

export class AppTestElement extends ConnectedElement {
  logger = new Logger('Test');

  @internalProperty()
  loading = true;

  @internalProperty()
  state: string = 'initializing';

  @internalProperty()
  error: string = '';

  remote: EveesHttp;

  privateSection!: Secured<Perspective>;
  blogSection!: Secured<Perspective>;

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async firstUpdated() {
    this.error = '';
    this.remote = this.evees.getRemote();
    this.run();
  }

  async run() {
    this.logger.log('run()');
    const isLogged = await this.remote.isLogged();

    if (!isLogged) {
      this.state = 'logging in';
      await this.login();
    }

    this.state = 'initializing appManager';
    await this.initializeElements();

    this.state = 'updating page';
    await this.updatePage();

    this.state = 'publishToBlog';
    await this.publishToBlog();

    this.loading = false;
    this.state = 'finished';
  }

  async login() {
    const connectionId = ETH_ACCOUNT_CONNECTION;
    const multiConnection: HttpMultiConnection = this.remote.connection as any;

    multiConnection.select(connectionId);
    const connection = multiConnection.connection();

    await connection.login();
  }

  async initializeElements() {
    this.logger.log('initializeElements()');
    await this.appManager.init();

    this.privateSection = await this.appManager.elements.get(
      '/linkedThoughts/privateSection'
    );
    this.blogSection = await this.appManager.elements.get(
      '/linkedThoughts/blogSection'
    );

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    if (privateSectionData.object.pages.length !== 1) {
      this.error = 'private page not created';
      throw new Error();
    }
  }

  async updatePage() {
    this.logger.log('updatePage()');
    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    const pageId = privateSectionData.object.pages[0];

    await this.evees.updatePerspectiveData({
      perspectiveId: pageId,
      object: {
        text: 'Page title',
        type: TextType.Title,
        links: [],
      },
    });

    await this.evees.addNewChild(pageId, {
      text: 'par 1',
      type: TextType.Title,
      links: [],
    });

    await this.evees.addNewChild(pageId, {
      text: 'par 2',
      type: TextType.Title,
      links: [],
    });

    await this.evees.addNewChild(pageId, {
      text: 'par 3',
      type: TextType.Title,
      links: [],
    });

    await this.evees.flush();
  }

  async publishToBlog() {
    this.logger.log('publishToBlog()');

    const privateSectionData = await this.evees.getPerspectiveData<Section>(
      this.privateSection.id
    );

    const pageId = privateSectionData.object.pages[0];

    const pageData = await this.evees.getPerspectiveData<TextNode>(pageId);

    // fork of page
    await this.appManager.createForkOn(pageId, this.blogSection.id);

    // assert
    const forks = await this.appManager.getForkedIn(pageId);
    if (forks.length !== 1) {
      this.logger.error(`fork of ${pageId} not correct`, { forks });
    }

    // forks of paragraphs
    await Promise.all(
      pageData.object.links.map(async (par) => {
        const parForks = await this.appManager.getForkedIn(par);
        if (parForks.length !== 1) {
          this.logger.error(`fork of ${par} not correct`, { parForks });
        }
      })
    );
  }

  render() {
    return html`<div
        class=${`callout state ${this.state === 'finished' ? 'success' : ''}`}
      >
        ${this.state}
      </div>
      ${this.error ? html`<div class="callout error">${this.error}</div>` : ''}`;
  }

  static get styles() {
    return [
      styles,
      sharedStyles,
      css`
        :host {
          display: flex;
          flex: 1 1 0;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .callout {
          border: 2px solid black;
          padding: 1rem;
          width: 250px;
          border-radius: 5px;
          margin-bottom: 12px;
          box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
        }
        .error {
          color: red;
          border-color: red;
        }
        .success {
          color: green;
          border-color: green;
        }
      `,
    ];
  }
}
