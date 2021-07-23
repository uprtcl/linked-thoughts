import { TextNode, TextType } from '@uprtcl/documents';
import { PushChanges } from './04-push-changes';

export class CreatePage extends PushChanges {
  async createPage() {
    await this.dashboard.newPage();
  }
}
