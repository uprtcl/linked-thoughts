import { TextNode, TextType } from '@uprtcl/documents';
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
  SearchResult,
  ClientCachedLocal,
  CASLocal,
  CacheLocal,
  Update,
  Signed,
} from '@uprtcl/evees';
import { EveesHttp, PermissionType } from '@uprtcl/evees-http';
import { AppError } from './app.error';
import { Dashboard, Section } from '../containers/types';

export enum ConceptId {
  BLOGHOME = 'bloghome',
  BLOGPOST = 'blogpost',
}

export class AppManager {
  elements: AppElements;
  appError: AppError;
  draftEvees!: Evees;

  constructor(protected evees: Evees, appElementsInit: AppElement) {
    this.elements = new AppElements(evees, appElementsInit);
    this.appError = new AppError();
  }

  async getConcept(conceptId: ConceptId): Promise<Secured<Perspective>> {
    switch (conceptId) {
      case ConceptId.BLOGHOME:
      case ConceptId.BLOGPOST:
        return getConceptPerspective(conceptId);
    }
  }

  async init() {
    await this.checkStructure();
    await this.initDraftsLocal();
  }

  async checkStructure() {
    /** check the app scheleton is there */
    await this.elements.check();
    await this.checkBlogPermissions();
  }

  async initDraftsLocal() {
    const draftClient = new ClientCachedLocal(
      new CASLocal('local', this.evees.client.store, false),
      this.evees.client,
      false,
      'local'
    );

    this.draftEvees = await this.evees.clone(`Draft Evees`, draftClient);
  }

  getDraftEvees(): Evees {
    return this.draftEvees;
  }

  /** init blog ACL to publicRead privateWrite (HTTP-remote-specific)
   *  verify blog concept is linked to the blog section
   */
  async checkBlogPermissions() {
    const blogSection = await this.elements.get('/linkedThoughts/blogSection');

    const remote = this.evees.getRemote() as EveesHttp;
    await remote.accessControl.toggleDelegate(blogSection.id, false);
    await remote.accessControl.setPublicPermissions(
      blogSection.id,
      PermissionType.Read,
      true
    );

    // check or associate the blog section with the BLOGHOME concept
    const blogHomeConcept = await this.getConcept(ConceptId.BLOGHOME);

    // get the current Section data of the blog section
    const blogSectionData = await this.evees.getPerspectiveData<Section>(
      blogSection.id
    );

    if (
      blogSectionData.object.meta === undefined ||
      blogSectionData.object.meta.isA === undefined ||
      !blogSectionData.object.meta.isA.includes(blogHomeConcept.id)
    ) {
      // append the bloghome concept
      const isAOrg = blogSectionData.object.meta
        ? blogSectionData.object.meta.isA
        : [];
      const isANew = isAOrg.concat([blogHomeConcept.id]);

      const blogDataNew: Section = {
        ...blogSectionData.object,
        meta: {
          isA: isANew,
        },
      };

      /** update the section data (adding the link) */
      await this.evees.updatePerspectiveData({
        perspectiveId: blogSection.id,
        object: blogDataNew,
      });
      await this.evees.client.flush();
    }
  }

  async newPage(onSectionId: string): Promise<string> {
    const page: TextNode = {
      text: '',
      type: TextType.Title,
      links: [],
    };
    const childId = await this.evees.addNewChild(onSectionId, page);
    await this.evees.client.flush();

    return childId;
  }

  /** takes all changes under a given page, squash them as new commits and remove them from the drafts client */
  async commitPage(pageId: string) {
    /** get all changes on the local client and persist them on the evees client */
    const cache = (this.draftEvees.client as ClientCachedLocal)
      .cache as CacheLocal;

    const perspectiveIds = await cache.getUnder(pageId);

    await Promise.all(
      perspectiveIds.map(async (perspectiveId) => {
        /** creates a new commit with the same data as the latest dat in the draft (don't keep the
         * commit history of the draft) */
        let update: Update | undefined = undefined;
        let isNew: Boolean = false;

        const newPerspective = await cache.getNewPerspective(perspectiveId);
        if (newPerspective) {
          update = newPerspective.update;
          isNew = true;
        }

        const lastUpdate = await cache.getLastUpdate(perspectiveId);

        if (lastUpdate) {
          update = lastUpdate; // last update is what counts
        }

        if (update) {
          const data = update.details.headId
            ? await this.draftEvees.getCommitData(update.details.headId)
            : undefined;

          const perspective = await this.draftEvees.client.store.getEntity<
            Signed<Perspective>
          >(perspectiveId);

          /** target it to the remote store  */
          perspective.casID = this.evees.getRemote().casID;

          if (isNew) {
            await this.evees.client.store.storeEntity(perspective);
            await this.evees.createEvee({
              perspectiveId,
              object: data.object,
              guardianId: newPerspective.update.details.guardianId,
            });
          } else {
            /** just update the perspective data (no guardian update or anything) */
            await this.evees.updatePerspectiveData({
              perspectiveId,
              object: data.object,
            });
          }
        }
      })
    );

    await this.evees.client.flush();

    /** clean perspectives from the cache */
    await Promise.all(
      perspectiveIds.map(async (perspectiveId) =>
        cache.clearPerspective(perspectiveId)
      )
    );
  }

  /**  */
  async forkPage(
    pageId: string,
    onSectionId: string,
    flush: boolean = true
  ): Promise<string> {
    /** moves the page draft changes to the evees client */
    await this.commitPage(pageId);

    /** and creates a fork */
    const forkId = await this.evees.forkPerspective(
      pageId,
      undefined,
      onSectionId
    );
    await this.evees.addExistingChild(forkId, onSectionId);

    if (flush) {
      await this.evees.client.flush();
    }

    return forkId;
  }

  async getBlogFeed(
    offset: number,
    first: number,
    text?: string,
    userId?: string
  ): Promise<SearchResult> {
    const blogConcept = await this.getConcept(ConceptId.BLOGPOST);
    const userHome = userId
      ? await getHome(this.evees.getRemote(), userId)
      : undefined;

    const result = await this.evees.client.searchEngine.explore(
      {
        under: userHome ? [{ id: userHome.id }] : undefined,
        linksTo: [{ id: blogConcept.id }],
        pagination: {
          offset,
          first,
        },
        text: text
          ? {
              value: text,
              levels: -1,
            }
          : undefined,
      },
      {
        entities: true,
        levels: 0,
      }
    );
    return result;
  }

  // TODO: TEST: find another user's blogs to simulate follows
  async getBlogIdOf(userId: string): Promise<string | undefined> {
    const userHome = await getHome(this.evees.getRemote(), userId);
    const blogHomeConcept = await this.getConcept(ConceptId.BLOGHOME);

    const result = await this.evees.client.searchEngine.explore({
      under: [{ id: userHome.id }],
      linksTo: [{ id: blogHomeConcept.id }],
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
      dashboardPerspective.id
    );
    return dashboardData.object.sections;
  }

  /** find all the sections where other perspectives of a page have been
   * created */
  async getForkedIn(pageId: string): Promise<ParentAndChild[]> {
    const locations = await this.evees.client.searchEngine.locate(pageId, true);
    return locations;
  }

  /** returns an Evees service with its state modified with the effect of the merge */
  async compareForks(to: string, from: string): Promise<Evees> {
    const config = {
      forceOwner: true,
    };

    // Create a temporary workspaces to compute the merge
    const evees = await this.evees.clone();
    const merger = new RecursiveContextMergeStrategy(evees);
    await merger.mergePerspectivesExternal(to, from, config);

    return evees;
  }

  async workspaceHasChanges(evees: Evees) {
    // see if the temporary workspaces has updated any perspective
    const diff = await evees.client.diff();
    return diff.updates ? diff.updates.length > 0 : false;
  }
}
