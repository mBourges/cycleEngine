import xs from 'xstream';
import { h1 } from '@cycle/dom';

function home(sources) {
  return {
    DOM: xs.of(h1('HOME'))
  }
}

export default home;
