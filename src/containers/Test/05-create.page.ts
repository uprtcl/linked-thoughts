import { TextNode, TextType } from '@uprtcl/documents';
import { PushChanges } from './04-push-changes';

const PAGE_TITLE = 'Page title 2';
const PAGE_SUBTITLE = 'Subtitle 1';
const PAGE_SUBTITLE_11 = 'Subtitle 1.1';
const PARS = ['Par1', 'Par2', 'Par3'];
const SUB_PARS = ['SubPar1'];

export class CreatePage extends PushChanges {
  async createPage() {
    await this.dashboard.newPage();

    // time to load the page and the editor
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

    const editor = this.dashboard.docPage.documentEditor;

    const title: TextNode = {
      text: PAGE_TITLE,
      type: TextType.Title,
      links: [],
    };

    await editor.contentChanged(editor.doc, title);
    await editor.split(editor.doc, PARS[0], true);
    await editor.split(editor.doc.childrenNodes[0], PARS[1], false);
    await editor.split(editor.doc.childrenNodes[1], PARS[2], false);

    const subtitle: TextNode = {
      text: PAGE_SUBTITLE,
      type: TextType.Title,
      links: [],
    };

    await editor.contentChanged(editor.doc.childrenNodes[1], subtitle);
    await editor.split(editor.doc.childrenNodes[1], PARS[2], true);

    const subtitle11: TextNode = {
      text: PAGE_SUBTITLE_11,
      type: TextType.Title,
      links: [],
    };

    await editor.contentChanged(
      editor.doc.childrenNodes[1].childrenNodes[0],
      subtitle11
    );

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

    await editor.contentChanged(
      editor.doc.childrenNodes[1].childrenNodes[0].childrenNodes[0],
      subpar
    );

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    await editor.contentChanged(
      editor.doc.childrenNodes[1].childrenNodes[0].childrenNodes[0],
      emptyPar
    );

    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    await editor.contentChanged(
      editor.doc.childrenNodes[1].childrenNodes[0].childrenNodes[0],
      subpar
    );
  }
}
