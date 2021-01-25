import { DocumentBaseRoute,SectionBaseRoute } from '../constants/routeNames';

export const GenerateDocumentRoute = (docId: string = ':docId') =>
  `${DocumentBaseRoute}/${docId}`;

  export const GenerateSectionRoute = (sectionId: string = ':sectionId') =>
  `${SectionBaseRoute}/${sectionId}`;
