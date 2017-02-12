import xs from 'xstream';
import { div, a, nav, ul, li } from '@cycle/dom';
import menu from './menu'

import './style.scss';

function destopMenu({ DOM, props }) {
  return {
    DOM: xs.of(div('.toc', [
  div('.ui .vertical .inverted .sticky .menu', menu /*[
    div('.item', [
      div('.menu', [
        a('.item .navLink', { props: { href: '/' } }, 'Home'),
      ])
    ]),
    div('.item', [
      div('.header', 'Students'),
      div('.menu', [
        a('.item .navLink', { props: { href: '/student' } }, 'search'),
        a('.item .navLink', { props: { href: '/inquiry/new' } }, 'New Toiawase'),
        a('.item .logout', { props: { href: '/' } }, 'logout'),
      ])
    ])
  ] */)
]))
  };
}

export default destopMenu;
