import {
  DocumentBaseRoute,
  PageVisitorRoute,
  SectionBaseRoute,
} from '../constants/routeNames';

export enum RouteName {
  dashboard = 'dashboard',
  page = 'page',
  section = 'section',
}

export const GenerateDocumentRoute = (docId: string = ':docId') =>
  `${DocumentBaseRoute}/${docId}`;

export const GenerateSectionRoute = (sectionId: string = ':sectionId') =>
  `${SectionBaseRoute}/${sectionId}`;

export const GenerateReadDocumentRoute = (docId: string = ':docId') =>
  `${PageVisitorRoute}/${docId}`;
