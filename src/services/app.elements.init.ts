import { TextType } from '@uprtcl/documents';
import { AppElement } from '@uprtcl/evees';

import { Dashboard } from '../containers/types';

export const appElementsInit: AppElement = {
  path: '/',
  getInitData: (children: AppElement[]) => {
    return { linkedThoughts: children[0].perspective.hash };
  },
  children: [
    {
      path: '/linkedThoughts',
      getInitData: (children: AppElement[]): Dashboard => {
        return { sections: children.map((child) => child.perspective.hash) };
      },
      children: [
        {
          path: '/privateSection',
          getInitData: (children: AppElement[]) => {
            return {
              title: 'Private',
              pages: children.map((child) => child.perspective.hash),
            };
          },
          children: [
            {
              path: '/firstPage',
              optional: true,
              getInitData: () => {
                return {
                  text: '',
                  type: TextType.Title,
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
        {
          path: '/forksSection',
          getInitData: () => {
            return {
              title: 'Forks',
              pages: [],
            };
          },
        },
        {
          path: '/clipboardSection',
          getInitData: () => {
            return {
              title: 'Clipboard',
              pages: [],
            };
          },
        },
      ],
    },
  ],
};
