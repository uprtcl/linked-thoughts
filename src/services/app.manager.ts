import { EventEmitter } from 'events';

import { TextType } from '@uprtcl/documents';
import {
  AppElement,
  AppElements,
  Evees,
  ParentAndChild,
  RecursiveContextMergeStrategy,
  getConceptPerspective,
  Secured,
  Perspective,
  getHome,
  UpdatePerspectiveData,
  Logger,
  Join,
} from '@uprtcl/evees';
import { EveesHttp, PermissionType } from '@uprtcl/evees-http';
import { AppError } from './app.error';
import { Dashboard, Section, ThoughtsTextNode } from '../containers/types';
import { MetaHelper } from './meta.helper';

export enum ConceptId {
  BLOGHOME = 'bloghome',
  BLOGPOST = 'blogpost',
  PAGE = 'page',
}

export enum AppEvents {
  blogPostCreated = 'blog-post-created',
}

export const BLOG_POST_PUBLISHED_EVENT_TAG = 'blogpost-published';

const LOGINFO = false;

export class AppManager {
  logger = new Logger('AppManager');

  events: EventEmitter;
  elements: AppElements;
  appError: AppError;

  constructor(protected evees: Evees, appElementsInit: AppElement) {
    this.elements = new AppElements(evees, appElementsInit);
    this.appError = new AppError();

    this.events = new EventEmitter();
    this.events.setMaxListeners(1000);
  }

  async getConcept(conceptId: ConceptId): Promise<Secured<Perspective>> {
    return getConceptPerspective(conceptId);
  }

  async init() {
    await this.checkStructure();
  }

  async checkStructure() {
    /** check the app scheleton is there */
    await this.elements.check();
    await this.checkBlogPermissions();
  }

  /** init blog ACL to publicRead privateWrite (HTTP-remote-specific)
   *  verify blog concept is linked to the blog section
   */
  async checkBlogPermissions() {
    const blogSection = await this.elements.get('/linkedThoughts/blogSection');

    const remote = this.evees.getRemote() as EveesHttp;
    await remote.accessControl.toggleDelegate(blogSection.hash, false);
    await remote.accessControl.setPublicPermissions(
      blogSection.hash,
      PermissionType.Read,
      true
    );

    // check or associate the blog section with the BLOGHOME concept
    const blogHomeConcept = await this.getConcept(ConceptId.BLOGHOME);

    // get the current Section data of the blog section
    const blogSectionData = await this.evees.getPerspectiveData<Section>(
      blogSection.hash
    );

    if (
      blogSectionData.object.meta === undefined ||
      blogSectionData.object.meta.isA === undefined ||
      !blogSectionData.object.meta.isA.includes(blogHomeConcept.hash)
    ) {
      // append the bloghome concept
      const isAOrg = blogSectionData.object.meta
        ? blogSectionData.object.meta.isA
        : [];
      const isANew = isAOrg.concat([blogHomeConcept.hash]);

      const blogDataNew: Section = {
        ...blogSectionData.object,
        meta: {
          isA: isANew,
        },
      };

      /** update the section data (adding the link) */
      await this.evees.updatePerspectiveData({
        perspectiveId: blogSection.hash,
        object: blogDataNew,
      });
      await this.evees.flush();
    }
  }

  async newPage(onSectionId: string): Promise<string> {
    const pageConcept = await this.getConcept(ConceptId.PAGE);
    const page: ThoughtsTextNode = {
      text: '',
      type: TextType.Title,
      links: [],
      meta: {
        isA: [pageConcept.hash],
      },
    };
    const childId = await this.evees.addNewChild(onSectionId, page);
    await this.evees.flush();

    return childId;
  }

  /** persist all changes in the drafEvees of a given page to the backend */
  async commitUnder(elementId: string) {
    await this.evees.flush(
      {
        start: { elements: [{ id: elementId }] },
      },
      -1
    );
  }

  async forkPage(
    pageId: string,
    onSectionId: string,
    flush: boolean = true
  ): Promise<string> {
    /** condensate and commit all current local changes to the backend */
    await this.commitUnder(pageId);

    const forkId = await this.evees.forkPerspective(
      pageId,
      undefined,
      onSectionId
    );
    await this.evees.addExistingChild(forkId, onSectionId);

    if (flush) {
      await this.commitUnder(forkId);
    }

    return forkId;
  }

  async addToClipboard(
    forkId: string,
    onSectionId: string,
    flush: boolean = true
  ): Promise<void> {
    await this.evees.addExistingChild(forkId, onSectionId);

    if (flush) {
      await this.evees.flush();
    }
  }

  async addBlogPost(postId: string, flush: boolean = true) {
    const data = await this.evees.getPerspectiveData<ThoughtsTextNode>(postId);
    const blogConcept = await this.getConcept(ConceptId.BLOGPOST);
    /** keep the the entire object and append the blogConcept to the isA array. */
    const newObject = MetaHelper.addIsA(data.object, [blogConcept.hash], true);

    const updateData: UpdatePerspectiveData = {
      perspectiveId: postId,
      object: newObject,
    };

    await this.evees.updatePerspectiveData(updateData);
    if (flush) {
      await this.evees.flush();
    }
    this.events.emit(AppEvents.blogPostCreated, [postId]);
  }

  async createForkOn(pageId: string, onSectionId: string): Promise<string> {
    const forkId = await this.forkPage(pageId, onSectionId, false);
    if (LOGINFO) this.logger.log('createForkOn', { forkId, uref: pageId });
    await this.addBlogPost(forkId, true);
    return forkId;
  }

  // TODO: TEST: find another user's blogs to simulate follows
  async getBlogIdOf(userId: string): Promise<string | undefined> {
    const userHome = await getHome(this.evees.getRemote(), userId);
    const blogHomeConcept = await this.getConcept(ConceptId.BLOGHOME);

    const result = await this.evees.explore({
      start: { elements: [{ id: userHome.hash }] },
      linksTo: { elements: [blogHomeConcept.hash] },
    });

    if (result.perspectiveIds.length > 1) {
      throw Error(
        `Unexpected number ${result.perspectiveIds.length} of blog perspectives under user ${userId}`
      );
    }
    return result.perspectiveIds.length >= 1
      ? result.perspectiveIds[0]
      : undefined;
  }

  async getSections(): Promise<string[]> {
    const dashboardPerspective = await this.elements.get('/linkedThoughts');
    const dashboardData = await this.evees.getPerspectiveData<Dashboard>(
      dashboardPerspective.hash
    );
    return dashboardData.object.sections;
  }

  /** find all the sections where other perspectives of a page have been
   * created */
  async getForkedInMine(pageId: string): Promise<ParentAndChild[]> {
    const linkedThoughts = await this.elements.get('/linkedThoughts');

    const forks = await this.evees.explore({
      start: {
        joinType: Join.inner,
        elements: [
          {
            id: pageId,
            levels: 0,
            forks: {},
          },
          {
            id: linkedThoughts.hash,
          },
        ],
      },
    });

    const forksLocations = await Promise.all(
      forks.perspectiveIds.map(async (forkId) => {
        const result = await this.evees.explore({
          start: { elements: [{ id: forkId, direction: 'above', levels: 1 }] },
        });
        const parentsAndChildren = result.perspectiveIds.map(
          (pid): ParentAndChild => {
            if (pid !== pageId) {
              return {
                parentId: pid,
                childId: forkId,
              };
            }
          }
        );

        // remove undefined
        return parentsAndChildren.filter((el) => !!el);
      })
    );

    return Array.prototype.concat.apply([], forksLocations);
  }

  /** returns an Evees service with its state modified with the effect of the merge */
  async compareForks(to: string, from: string): Promise<Evees> {
    const config = {
      forceOwner: true,
    };

    // Create a temporary workspaces to compute the merge
    const evees = this.evees.clone('compare-client');
    const merger = new RecursiveContextMergeStrategy(evees);
    await merger.mergePerspectivesExternal(to, from, config);

    return evees;
  }
}
