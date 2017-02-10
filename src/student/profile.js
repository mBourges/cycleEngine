import xs from 'xstream';
import { div, h1 } from '@cycle/dom';

function profile(sources) {
  const component$ = xs.combine(
    sources.location.params,
    sources.location.query
  ).map(([params, query]) => div([
      h1('PROFILE'),
      h1(params.id),
      h1(query.field)
    ]))


  return {
    DOM: component$ //xs.of(h1('PROFILE'))
  }
}

export default profile;
