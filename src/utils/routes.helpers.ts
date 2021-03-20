import { Router } from '@vaadin/router';
import {
  DocumentBaseRoute,
  PageVisitorRoute,
  SectionBaseRoute,
  UserProfileRoute,
  ForksRoute,
} from '../constants/routeNames';

export enum RouteName {
  dashboard = 'dashboard',
  page = 'page',
  section = 'section',
  fork = 'fork',
}

export const GenerateDocumentRoute = (docId: string = ':docId') =>
  `${DocumentBaseRoute}/${docId}`;

export const GenerateSectionRoute = (sectionId: string = ':sectionId') =>
  `${SectionBaseRoute}/${sectionId}`;

export const GenerateForksRoute = () => {
  return `${ForksRoute}`;
};
export const GenerateReadDocumentRoute = (docId: string = ':docId') =>
  `${PageVisitorRoute}/${docId}`;

export const GenerateUserRoute = (userId: string = ':userId') =>
  `${UserProfileRoute}/${userId}`;

export const GenerateUserDocRoute = (
  userId: string = ':userId',
  docId: string = ':docId'
) => `${UserProfileRoute}/${userId}/${docId}`;

export const NavigateTo404 = () => Router.go('/404');
