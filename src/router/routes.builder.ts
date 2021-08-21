import { RouteBase } from './routes.types';

export const ORIGIN = window.location.origin;

export const GenerateDocumentRoute = (pageId: string = ':pageId') =>
  `${RouteBase.dashboard_page}/${pageId}`;

export const GenerateSectionRoute = (sectionId: string = ':sectionId') =>
  `${RouteBase.dashboard_section}/${sectionId}`;

export const GenerateReadDocumentRoute = (pageId: string = ':pageId') =>
  `${RouteBase.read_page}/${pageId}`;

export const GenerateUserRoute = (userId: string = ':userId') =>
  `${RouteBase.user_blog}/${userId}`;

export const GenerateUserDocRoute = (
  userId: string = ':userId',
  pageId: string = ':pageId'
) => `${RouteBase.user_blog}/${userId}/${pageId}`;

export const GenearateReadURL = (docId: string) => {
  if (docId) return `${ORIGIN}${GenerateReadDocumentRoute(docId)}`;
};

export const GenearateUserDocReadURL = (userId: string, docId: string) => {
  if (userId && docId) return `${ORIGIN}${GenerateUserDocRoute(userId, docId)}`;
};
