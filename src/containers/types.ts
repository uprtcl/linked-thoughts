import { TextNode } from '@uprtcl/documents';

export interface Home {
  linkedThoughts: string;
}

export interface Dashboard {
  sections: string[];
}

export interface Section {
  title: string;
  pages: string[];
  text: string;
  meta: {
    isA: string[];
  };
}

export interface ThoughtsTextNode extends TextNode {
  meta: {
    isA: string[];
  };
}
