import { TextNode, TextType } from '@uprtcl/documents';
import { UpdateAndRead2 } from './06-update.and.read-2';

const PAGE_TITLE = 'Page title 4';
const PARS = ['Par1', 'Par2', 'Par3'];

const LOGINFO = false;

export class CreatePage3 extends UpdateAndRead2 {
  async createPage3() {
    await this.dashboard.newPage();

    // time to load the page and the editor
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

    const editor = this.dashboard.docPage.documentEditor;

    const title: TextNode = {
      text: PAGE_TITLE,
      type: TextType.Title,
      links: [],
    };

    if (LOGINFO)
      this.logger.log('createPage - contentChanged', {
        node: editor.doc,
        value: title,
      });
    await editor.contentChanged(editor.doc, title);

    if (LOGINFO)
      this.logger.log('createPage - split', {
        node: editor.doc,
        tail: PARS[0],
        asChild: true,
      });
    await editor.split(editor.doc, PARS[0], true);

    if (LOGINFO)
      this.logger.log('createPage - split', {
        node: editor.doc.childrenNodes[0],
        tail: PARS[1],
        asChild: false,
      });
    await editor.split(editor.doc.childrenNodes[0], PARS[1], false);

    if (LOGINFO)
      this.logger.log('createPage - split', {
        node: editor.doc.childrenNodes[1],
        tail: PARS[2],
        asChild: false,
      });
    await editor.split(editor.doc.childrenNodes[1], PARS[2], false);

    // Commit to flush to the backend
    const awaiting = this.awaitPending();
    await this.dashboard.appManager.commitUnder(editor.doc.uref);
    await awaiting;

    if (LOGINFO) this.logger.log('done creating page 3');
  }
}
