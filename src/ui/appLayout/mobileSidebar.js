import xs from 'xstream';
import { div, a, nav, ul, li, i } from '@cycle/dom';
import menu from './menu'

import './style.scss';

function mobileSidebar({ DOM, props }) {
  const isOpen$ =  props.map(props => props.isOpen$)
    .flatten().startWith(false)

  const component$ = isOpen$
    .map(isOpen => div('.ui.vertical.inverted.sidebar.menu.left.animating.overlay', {
      class: {
        visible: isOpen,
        hidden: !isOpen
      }
    }, menu));

  return {
    DOM: component$
  };
}

export default mobileSidebar;
