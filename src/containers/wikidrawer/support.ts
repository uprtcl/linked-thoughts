import { TextType } from '@uprtcl/documents';
import { Evees } from '@uprtcl/evees';

export class AppSupport {
  static async getRemote(evees: Evees) {
    return evees.findRemote('http');
  }

  static async InitWorkspace(evees: Evees, on: string) {
    const dashboardId = await evees.createEvee({
      partialPerspective: {
        context: 'linked-thoughts.dashboard',
        timestamp: 0,
      },
      parentId: on,
    });

    const privateId = await evees.createEvee({
      parentId: dashboardId,
    });

    const publicId = await evees.createEvee({
      parentId: dashboardId,
    });

    const pageId = await evees.createEvee({
      object: {
        text: '',
        type: TextType.Title,
        links: [],
      },
      parentId: privateId,
    });

    await evees.updatePerspectiveData(privateId, {
      title: 'Private',
      pages: [pageId],
    });

    await evees.updatePerspectiveData(publicId, {
      title: 'Blog',
      pages: [],
    });

    await evees.updatePerspectiveData(on, {
      linkedThoughts: dashboardId,
    });

    await evees.client.flush();
  }
}
