export interface Home {
  linkedThoughts: string;
}

export interface Dashboard {
  sections: string[];
}

export interface Section {
  title: string;
  pages: string[];
}

/**
 * Possible cases
 * -> Page is only in Private (Can be shared)
 * -> Page is only in other section (Blog) (Cannot be shared)
 * -> Page is already shared in other sections, means it exists in private as well as other sections (Can be unshared)
 */
export interface PageShareMeta {
  inPrivate: boolean; // If false hide the Share to blog feature
  inSections: Array<string>; // If inSections.length == 2, page is already shared
}
