import xs from 'xstream';
import { div, a, nav, ul, li, i } from '@cycle/dom';

import './style.scss';

function mobileMenu({ DOM, props }) {
  const openMenu$ = DOM.select('a.launch').events('click')
    .debug(event => {
      event.preventDefault();
      event.stopPropagation();
    })
    .mapTo(true);

  return {
    openMenu$,
    DOM: xs.of(div('.mobile.ui.fixed.inverted.main.menu', [
        div('.ui.container', [
          a('.launch .icon .item', [
            i('.content .icon')
          ]),
          div('.item', 'Sidebar'),
          div('.right .menu', [
            div('.vertically .fitted .borderless .item', [])
          ])
        ])
    ]))
  };
}

export default mobileMenu;
