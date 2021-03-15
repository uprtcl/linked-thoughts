import { LastVisitedKey } from '../constants/localStorage';
import { RouteName } from './routes.helpers';

export const SetLastVisited = (type: string, id: string) => {
  localStorage.setItem(LastVisitedKey, JSON.stringify({ type, id }));
};

export const GetLastVisited = (): { type: RouteName; id: string } => {
  return JSON.parse(localStorage.getItem(LastVisitedKey));
};

export const DeleteLastVisited = () => {
  localStorage.removeItem(LastVisitedKey);
};
