import {
  AsyncQueue,
  CacheLocal,
  CASLocal,
  ClientCachedLocal,
  CreateEvee,
  Evees,
  EveesMutation,
  Perspective,
  Signed,
  UpdatePerspectiveData,
} from '@uprtcl/evees';

/** A service that keeps changes on a locally cached evees client and 
can persist them to the base client. Almost a Client :/ */
export class DraftsManager {
  protected draftEvees: Evees;
  protected cache!: CacheLocal;
  protected updateQueue: AsyncQueue;

  /** a store of pending udpates to debounce repeated ones*/
  protected pendingUpdates: Map<
    string,
    { action: Function; timeout: NodeJS.Timeout; called: boolean }
  > = new Map();

  constructor(protected baseEvees: Evees) {
    this.updateQueue = new AsyncQueue();
  }

  async init() {
    const draftClient = new ClientCachedLocal(
      new CASLocal('local', this.baseEvees.client.store, false),
      this.baseEvees.client,
      false,
      'local'
    );

    this.draftEvees = await this.baseEvees.clone(`Draft Evees`, draftClient);

    this.cache = (this.draftEvees.client as ClientCachedLocal)
      .cache as CacheLocal;
  }

  get evees(): Evees {
    return this.draftEvees;
  }

  async flushPendingUpdates() {
    /** execute pending updates */
    Array.from(this.pendingUpdates.values()).map((e) => {
      if (!e.called) {
        clearTimeout(e.timeout);
        e.action();
      }
    });

    /** await the last queued action is executed */
    if (this.updateQueue._items.length > 0) {
      await this.updateQueue._items[
        this.updateQueue._items.length - 1
      ].action();
    }
  }

  /** returns an EveesMutation with the new perspectives and **last** update under a given page
   * created un the draftsEvees */
  async getDiffUnder(ecosystemId: string): Promise<EveesMutation> {
    const perspectiveIds = await this.cache.getUnder(ecosystemId);
    const mutation: EveesMutation = {
      newPerspectives: [],
      updates: [],
      entities: [],
      deletedPerspectives: [],
    };

    await Promise.all(
      perspectiveIds.map(async (perspectiveId) => {
        const newPerspective = await this.cache.getNewPerspective(
          perspectiveId
        );
        if (newPerspective) {
          mutation.newPerspectives.push(newPerspective);
        }

        const update = await this.cache.getLastUpdate(perspectiveId);
        if (update) {
          mutation.updates.push(update);
        }
      })
    );

    return mutation;
  }

  /** takes all changes under a given page, squash them as new commits and remove them from the drafts client */
  async commitEcosystem(ecosystemId: string) {
    await this.flushPendingUpdates();

    const pageMutation = await this.getDiffUnder(ecosystemId);

    const allUpdates = pageMutation.newPerspectives
      .map((np) => np.update)
      .concat(pageMutation.updates);

    await Promise.all(
      allUpdates.map(async (update) => {
        const perspectiveId = update.perspectiveId;
        const newPerspective = pageMutation.newPerspectives.find(
          (np) => np.perspective.id === perspectiveId
        );

        const data = update.details.headId
          ? await this.draftEvees.getCommitData(update.details.headId)
          : undefined;

        const perspective = await this.draftEvees.client.store.getEntity<
          Signed<Perspective>
        >(perspectiveId);

        /** target it to the remote store  */
        perspective.casID = this.baseEvees.getRemote().casID;

        if (newPerspective !== undefined) {
          await this.baseEvees.client.store.storeEntity(perspective);
          await this.baseEvees.createEvee({
            perspectiveId,
            object: data.object,
            guardianId: newPerspective.update.details.guardianId,
          });
        } else {
          /** just update the perspective data (no guardian update or anything) */
          await this.baseEvees.updatePerspectiveData({
            perspectiveId,
            object: data.object,
          });
        }
      })
    );

    await this.baseEvees.client.flush();

    /** clean perspectives from the cache */
    await Promise.all(
      allUpdates.map(async (update) =>
        this.cache.clearPerspective(update.perspectiveId)
      )
    );
  }

  executePending(perspectiveId: string) {
    const pending = this.pendingUpdates.get(perspectiveId);
    pending.called = true;
    pending.action();
  }

  /** if interval !== 0, debounce update by waiting for an interval before executing
   * them and overwriting it with now ones if received before it was executed.  */
  updatePerspective(update: UpdatePerspectiveData, interval: number = 0) {
    const action = () => this.draftEvees.updatePerspectiveData(update);

    if (interval === 0) {
      action();
      return;
    }

    /** if there is a timeout to execute an update to this perspective, delete it and create a new one */
    const pending = this.pendingUpdates.get(update.perspectiveId);
    if (pending && !pending.called && pending.timeout) {
      clearTimeout(pending.timeout);
    }

    const newTimeout = setTimeout(
      () => this.executePending(update.perspectiveId),
      interval
    );

    /** create a timeout to execute (queue) this update,
     * store the fn to be able to call it anticipatedly if needed */
    this.pendingUpdates.set(update.perspectiveId, {
      timeout: newTimeout,
      action,
      called: false,
    });
  }

  async createPerspective(newEvee: CreateEvee) {
    if (newEvee.perspective) {
      await this.draftEvees.client.store.storeEntity(newEvee.perspective);
    }
    this.updateQueue.enqueue(() => this.draftEvees.createEvee(newEvee));
  }
}
