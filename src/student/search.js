import xs from 'xstream';
import { h1 } from '@cycle/dom';

function search(sources) {
  return {
    DOM: xs.of(h1('Search'))
  }
}

export default search;
