import xs from 'xstream';
import { div, a, button, h2 } from '@cycle/dom';
import desktopMenu from './desktopMenu';
import mobileMenu from './mobileMenu';
import mobileSidebar from './mobileSidebar';

import './style.scss';

export default function AppLayout(sources, child) {
  const AppBar = desktopMenu({
    DOM: sources.DOM,
    props: xs.of({ title: 'Engine'})
  })

  const MobileAppBar = mobileMenu({
    DOM: sources.DOM,
    props: xs.of({ title: 'Engine'})
  })

  const isOpen$ = xs.merge(
    MobileAppBar.openMenu$,
    sources.DOM.select('.pusher.dimmed').events('click').mapTo(false)
  ).startWith(false).debug('isOpen');

  const MobileSidebar = mobileSidebar({
    DOM: sources.DOM,
    props: xs.of({ isOpen$: isOpen$ })
  })



  const app$ = xs.combine(AppBar.DOM, MobileAppBar.DOM, child.DOM, MobileSidebar.DOM, isOpen$)
    .map(([AppBarDOM, MobileAppBarDOM, childDOM, MobileSidebarDOM, isOpen]) =>
      div('.pushable', [
        MobileAppBarDOM,
        MobileSidebarDOM,
        div('.pusher', {class: { dimmed: isOpen }}, [
          div('.full.height', [
            AppBarDOM,
            div('.article', [
              div('.article__inner', [
                childDOM
              ])
            ])
          ])
        ])
      ])
  )
  // const app$ = child.DOM.map(chilDOM => div('.pushable', [
  //   a('.navLink', { props: { href: '/' } }, 'HOME')
  //     , a('.navLink', { props: { href: '/student' } }, 'STUDENTS')
  //     , a('.navLink', { props: { href: '/student/123?field=name' } }, 'STUDENTS')
  //     , button('.go', 'GO')
  //     , h2('Welcome in Engine')
  //   , chilDOM
  // ]));

  return {
    DOM: app$,
    HTTP: child.HTTP || xs.never()
  };
}
