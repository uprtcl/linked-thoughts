import { initUprtcl } from './services/init';
import { App } from './app';
import { DashboardElement } from './containers/dashboard';
import { NavSectionElement } from './containers/NavBar/nav.section';
import { PageItemElement } from './containers/NavBar/nav.page.item';
import { GettingStartedElement } from './containers/getting-started';
import { SectionPage } from './containers/SectionPage/section.page';
import { VisitorElement } from './containers/visitor';
import { DocumentPage } from './containers/DocPage/doc.page';
import { ErrorPage } from './containers/ErrorPage/Error.page';
import ExploreSection from './containers/ExploreCard/Explore.section';
import ReadOnlyPage from './containers/ReadOnlyPage/ReadOnly.page';
import LTIntersectionObserver from './containers/IntersectionObserver/IntersectionObserver';
import UserPage from './containers/UserBlog/User.page';
import UserPageBlogSection from './containers/UserBlog/User.BlogSection';
import AppBarPublic from './components/PublicAppBar/Appbar.public';
// 3rd Party Components
import '@ui5/webcomponents/dist/Carousel';
import { BlockInfoPopper } from './containers/BlockInfo/block-info';
// Forks
import { AppTestElement } from './containers/Test/run.e2e.test';
import { BlockNotFound } from './components/BlockNotFound/BlockNotFound';
import { GridCardItem } from './containers/Collections/Items/grid-card.item';
import { TableRowItem } from './containers/Collections/Items/table-row.item';
import { BlockItemRouter } from './containers/Collections/Items/block.item.router';
import { EveesDataCollection } from './containers/Collections/Implementations/evees.data.collection';
import { ExploreCollection } from './containers/Collections/Implementations/explore.collection';
import { PageFeedItem } from './containers/Collections/Items/page-feed.Item';

(async function () {
  await initUprtcl();

  customElements.define('intercreativity-app', App);
  customElements.define('app-dashboard', DashboardElement);

  customElements.define('app-nav-section', NavSectionElement);
  customElements.define('app-nav-page-item', PageItemElement);

  customElements.define('app-getting-started', GettingStartedElement);
  customElements.define('app-visitor', VisitorElement);

  customElements.define('app-section-page', SectionPage);
  customElements.define('app-document-page', DocumentPage);
  customElements.define('app-error-page', ErrorPage);

  customElements.define('app-explore-section', ExploreSection);
  customElements.define('app-read-only-page', ReadOnlyPage);
  customElements.define('app-intersection-observer', LTIntersectionObserver);

  customElements.define('app-user-page', UserPage);
  customElements.define('app-user-page-blog-section', UserPageBlogSection);

  customElements.define('app-appbar-public', AppBarPublic);
  customElements.define('app-block-info', BlockInfoPopper);

  // Collections
  customElements.define('app-block-item', BlockItemRouter);
  customElements.define('app-item-grid-card', GridCardItem);
  customElements.define('app-item-table-row', TableRowItem);
  customElements.define('app-item-page-feed', PageFeedItem);

  customElements.define('app-evees-data-collection', EveesDataCollection);
  customElements.define('app-explore-collection', ExploreCollection);

  customElements.define('app-test', AppTestElement);
  customElements.define('app-error-block-not-found', BlockNotFound);
})();
