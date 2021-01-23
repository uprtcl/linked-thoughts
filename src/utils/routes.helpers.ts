import { DocumentBaseRoute } from '../constants/routeNames';

export const GenerateDocumentRoute = (docId: string = ':docId') =>
  `${DocumentBaseRoute}/${docId}`;
