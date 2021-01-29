import { TextType } from '@uprtcl/documents';
import { AppElement } from '@uprtcl/evees';

import { Dashboard } from '../containers/types';

export const appElementsInit: AppElement = {
  path: '/',
  getInitData: (children: AppElement[]) => {
    return { linkedThoughts: children[0].perspective.id };
  },
  children: [
    {
      path: '/linkedThoughts',
      getInitData: (children: AppElement[]): Dashboard => {
        return { sections: children.map((child) => child.perspective.id) };
      },
      children: [
        {
          path: '/privateSection',
          getInitData: (children: AppElement[]) => {
            return {
              title: 'Private',
              pages: children.map((child) => child.perspective.id),
            };
          },
          children: [
            {
              path: '/firstPage',
              getInitData: () => {
                return {
                  text: '',
                  type: TextType,
                  links: [],
                };
              },
            },
          ],
        },
        {
          path: '/blogSection',
          getInitData: () => {
            return {
              title: 'Blog',
              pages: [],
            };
          },
        },
      ],
    },
  ],
};
