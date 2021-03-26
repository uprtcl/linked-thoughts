import { ThoughtsTextNode } from '../containers/types';

export class MetaHelper {
  static addIsA(to: ThoughtsTextNode, isA: string[]): ThoughtsTextNode {
    if (!to.meta) {
      return {
        ...to,
        meta: {
          isA,
        },
      };
    }

    if (!to.meta.isA) {
      return {
        ...to,
        meta: {
          ...to.meta,
          isA,
        },
      };
    }

    to.meta.isA.push(...isA);
    return to;
  }
}
