import { TextType } from '@uprtcl/documents';
import { AppElement } from '@uprtcl/evees';

export const appElementsInit: AppElement = {
  path: '/',
  getInitData: (children: AppElement[]) => {
    return { linkedThoghts: children[0].perspective.id };
  },
  children: [
    {
      path: '/linkedThoughts',
      getInitData: (children: AppElement[]) => {
        return { sections: children.map((child) => child.perspective.id) };
      },
      children: [
        {
          path: '/privateSection',
          getInitData: (children: AppElement[]) => {
            return {
              text: 'Private',
              type: TextType,
              links: children.map((child) => child.perspective.id),
            };
          },
          children: [{ path: '/firstPage' }],
        },
        { path: '/blogSection' },
      ],
    },
  ],
};
