import { GenerateReadDocumentRoute } from './routes.helpers';

export const ORIGIN = window.location.origin;

export const GenearateReadURL = (docId: string) => {
  if (docId) return `${ORIGIN}${GenerateReadDocumentRoute(docId)}`;
};
