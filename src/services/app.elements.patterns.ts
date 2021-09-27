import { TextNode, TextNodePattern } from '@uprtcl/documents';
import {
  Pattern,
  HasChildren,
  HasLinks,
  LinkingBehaviorNames,
  MergeStrategy,
  mergeResult,
  mergeArrays,
  MergingBehaviorNames,
  HasMerge,
} from '@uprtcl/evees';

import { Dashboard, ThoughtsTextNode, Section } from '../containers/types';

export const DashboardType = 'LinkedThoughts:Dashboard';
export const ThoughtsTextNodeType = 'LinkedThoughts:ThoughtsTextNode';
export const SectionType = 'LinkedThoughts:Section';
export const HomeType = 'LinkedThoughts:UserHome';

export class AppHomePattern extends Pattern<any> {
  recognize(object: any): boolean {
    return !!object.linkedThoughts;
  }

  type = HomeType;

  constructor() {
    super([new AppHomeBehaviors()]);
  }
}

export class AppHomeBehaviors implements HasChildren<any> {
  [LinkingBehaviorNames.REPLACE_CHILDREN] = (node: any) => (
    childrenHashes: string[]
  ): any => ({
    ...node,
    linkedThoughts: childrenHashes[0],
  });

  [LinkingBehaviorNames.CHILDREN] = (node: any): string[] => [
    node.linkedThoughts,
  ];
}

export class DashboardPattern extends Pattern<Dashboard> {
  recognize(object: any): boolean {
    return !!object.sections;
  }

  type = DashboardType;

  constructor() {
    super([new DashboardBehaviors()]);
  }
}

export class DashboardBehaviors implements HasChildren<Dashboard> {
  [LinkingBehaviorNames.REPLACE_CHILDREN] = (node: Dashboard) => (
    childrenHashes: string[]
  ): Dashboard => ({
    ...node,
    sections: childrenHashes,
  });

  [LinkingBehaviorNames.CHILDREN] = (node: Dashboard): string[] =>
    node.sections;
}

export class ThoughtsTextNodePattern extends TextNodePattern {
  recognize(object: any): boolean {
    return (
      super.recognize(object) &&
      object.meta !== undefined &&
      object.meta.isA !== undefined
    );
  }

  type = ThoughtsTextNodeType;

  constructor() {
    super([new ThoughtsTextNodeBehaviors()]);
  }
}

export class ThoughtsTextNodeBehaviors
  implements HasLinks<ThoughtsTextNode>, HasMerge<ThoughtsTextNode> {
  [LinkingBehaviorNames.LINKS_TO] = (node: ThoughtsTextNode) => node.meta.isA;

  [MergingBehaviorNames.MERGE] = (originalNode: ThoughtsTextNode) => async (
    modifications: ThoughtsTextNode[],
    merger: MergeStrategy,
    config: any
  ): Promise<ThoughtsTextNode> => {
    const resultText = modifications[1].text;
    const resultType = mergeResult(
      originalNode.type,
      modifications.map((data) => data.type)
    );

    if (!merger.mergeChildren)
      throw new Error('mergeChildren function not found in merger');

    const mergedLinks = await merger.mergeChildren(
      originalNode.links,
      modifications.map((data) => data.links),
      config
    );

    /** meta.isA is not merged */

    return {
      text: resultText,
      type: resultType,
      links: mergedLinks,
      meta: originalNode.meta,
    };
  };
}

export class SectionPattern extends Pattern<Section> {
  recognize(object: any): boolean {
    return object.title !== undefined && object.pages !== undefined;
  }

  type = SectionType;

  constructor() {
    super([new SectionBehaviors()]);
  }
}

export class SectionBehaviors
  implements HasChildren<Section>, HasLinks<Section> {
  [LinkingBehaviorNames.LINKS_TO] = (node: Section): string[] =>
    node.meta ? node.meta.isA : [];

  title = (node: Section) => node.title;
  text = (node: Section) => node.text;

  [LinkingBehaviorNames.REPLACE_CHILDREN] = (node: Section) => (
    childrenHashes: string[]
  ): Section => ({
    ...node,
    pages: childrenHashes,
  });

  [LinkingBehaviorNames.CHILDREN] = (node: Section): string[] => node.pages;
}
