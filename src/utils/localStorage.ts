import { LastVisitedKey } from '../constants/localStoage';

export const SetLastVisited = (pageId: string) => {
  localStorage.setItem(LastVisitedKey, pageId);
};

export const GetLastVisited = (): string => {
  return localStorage.getItem(LastVisitedKey);
};
