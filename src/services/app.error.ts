import { GetLastVisited, SetLastVisited } from '../utils/localStorage';

export class AppError {
  clearLastVisited() {
    SetLastVisited('page', '');
  }
}
