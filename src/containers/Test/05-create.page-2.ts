import { TextNode, TextType } from '@uprtcl/documents';
import { PushChanges } from './04-push-changes';

const PAGE_TITLE = 'Page title 2';
const PAGE_SUBTITLE = 'Subtitle 1';
const PAGE_SUBTITLE_11 = 'Subtitle 1.1';
const PARS = ['Par1', 'Par2', 'Par3'];
const SUB_PARS = ['SubPar1'];

const LOGINFO = true;

export class CreatePage extends PushChanges {
  async createPage2() {
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

    const subtitle: TextNode = {
      text: PAGE_SUBTITLE,
      type: TextType.Title,
      links: [],
    };

    if (LOGINFO)
      this.logger.log('createPage - contentChanged', {
        node: editor.doc.childrenNodes[1],
        value: subtitle,
      });
    await editor.contentChanged(editor.doc.childrenNodes[1], subtitle);

    if (LOGINFO)
      this.logger.log('createPage - split', {
        node: editor.doc.childrenNodes[1],
        tail: PARS[2],
        asChild: true,
      });
    await editor.split(editor.doc.childrenNodes[1], PARS[2], true);

    const subtitle11: TextNode = {
      text: PAGE_SUBTITLE_11,
      type: TextType.Title,
      links: [],
    };

    if (LOGINFO)
      this.logger.log('createPage - contentChanged', {
        node: editor.doc.childrenNodes[1].childrenNodes[0],
        value: subtitle,
      });
    await editor.contentChanged(
      editor.doc.childrenNodes[1].childrenNodes[0],
      subtitle11
    );

    if (LOGINFO)
      this.logger.log('createPage - split', {
        node: editor.doc.childrenNodes[1].childrenNodes[0],
        tail: '',
        asChild: true,
      });
    await editor.split(editor.doc.childrenNodes[1].childrenNodes[0], '', true);

    const subpar: TextNode = {
      text: SUB_PARS[0],
      type: TextType.Paragraph,
      links: [],
    };

    const emptyPar: TextNode = {
      text: '',
      type: TextType.Paragraph,
      links: [],
    };

    if (LOGINFO)
      this.logger.log('createPage - contentChanged', {
        node: editor.doc.childrenNodes[1].childrenNodes[0].childrenNodes[0],
        value: subpar,
      });

    const awaiting = this.awaitPending();
    await editor.contentChanged(
      editor.doc.childrenNodes[1].childrenNodes[0].childrenNodes[0],
      subpar
    );
    await awaiting;

    if (LOGINFO) this.logger.log('done');
  }
}
