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
}

export interface Concept_TextNode extends TextNode {
  meta: {
    isA: string[];
  };
}