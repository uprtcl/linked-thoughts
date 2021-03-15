import { DeleteLastVisited } from '../utils/localStorage';

export class AppError {
  clearLastVisited() {
    DeleteLastVisited();
  }
}
