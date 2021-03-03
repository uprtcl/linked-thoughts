import {
  DocumentBaseRoute,
  PageVisitorRoute,
  SectionBaseRoute,
  UserProfileRoute,
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

export const GenerateUserRoute = (userId: string = ':userId') =>
  `${UserProfileRoute}/${userId}`;
