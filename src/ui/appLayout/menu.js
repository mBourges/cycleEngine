import xs from 'xstream';
import { div, a } from '@cycle/dom';

export default [
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
]
