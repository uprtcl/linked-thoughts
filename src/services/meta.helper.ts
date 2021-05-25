import lodash from 'lodash';
import { ThoughtsTextNode } from '../containers/types';

export class MetaHelper {
  static addIsA(
    to: ThoughtsTextNode,
    isA: string[],
    clone: boolean = false
  ): ThoughtsTextNode {
    const toEf = clone ? lodash.cloneDeep(to) : to;

    if (!toEf.meta) {
      return {
        ...toEf,
        meta: {
          isA,
        },
      };
    }

    if (!toEf.meta.isA) {
      return {
        ...toEf,
        meta: {
          ...toEf.meta,
          isA,
        },
      };
    }

    toEf.meta.isA.push(...isA);
    return toEf;
  }
}
