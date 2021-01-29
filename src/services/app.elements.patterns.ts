import { Pattern, HasChildren } from '@uprtcl/evees';

import { Dashboard, Section } from '../containers/types';

export const DashboardType = 'LinkedThoughts:Dashboard';
export const SectionType = 'LinkedThoughts:Section';

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
  links = async (node: Dashboard) => this.getChildrenLinks(node);

  replaceChildrenLinks = (node: Dashboard) => (
    childrenHashes: string[]
  ): Dashboard => ({
    ...node,
    sections: childrenHashes,
  });

  getChildrenLinks = (node: Dashboard): string[] => node.sections;
}

export class SectionPattern extends Pattern<Dashboard> {
  recognize(object: any): boolean {
    return !!object.pages;
  }

  type = SectionType;

  constructor() {
    super([new DashboardBehaviors()]);
  }
}

export class SectionBehaviors implements HasChildren<Section> {
  links = async (node: Section) => this.getChildrenLinks(node);

  replaceChildrenLinks = (node: Section) => (
    childrenHashes: string[]
  ): Section => ({
    ...node,
    pages: childrenHashes,
  });

  getChildrenLinks = (node: Section): string[] => node.pages;
}
