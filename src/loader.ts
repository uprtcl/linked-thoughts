import { Evees } from '@uprtcl/evees';
import { AppElement, AppSupport } from './containers/app.support';

export const APP_SUPPORT = 'app_support';

export const AppLoader = async (evees: Evees) => {
  const appElementsInit: AppElement = {
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

  const appSupport = new AppSupport(evees, appElementsInit);
  await appSupport.check();

  registerAppContainer({ id: APP_SUPPORT, dependency: appSupport });
};
