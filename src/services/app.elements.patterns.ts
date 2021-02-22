import { TextNodePattern } from '@uprtcl/documents';
import {
  Pattern,
  HasChildren,
  HasLinks,
  LinkingBehaviorNames,
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

export class ThoughtsTextNodeBehaviors implements HasLinks<ThoughtsTextNode> {
  [LinkingBehaviorNames.LINKS_TO] = (node: ThoughtsTextNode) => node.meta.isA;
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

export class SectionBehaviors implements HasChildren<Section> {
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
