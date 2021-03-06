import {
  GenerateReadDocumentRoute,
  GenerateUserDocRoute,
} from './routes.helpers';

export const ORIGIN = window.location.origin;

export const GenearateReadURL = (docId: string) => {
  if (docId) return `${ORIGIN}${GenerateReadDocumentRoute(docId)}`;
};

export const GenearateUserDocReadURL = (userId: string, docId: string) => {
  if (userId && docId) return `${ORIGIN}${GenerateUserDocRoute(userId, docId)}`;
};
