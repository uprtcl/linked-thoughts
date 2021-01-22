export interface Dashboard {
  sections: Map<string, string>;
}

export interface Section {
  title: string;
  pages: Map<string, string>;
}
