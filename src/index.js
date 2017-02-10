import xs from 'xstream';
import { run } from '@cycle/run';
import { makeDOMDriver, div, h2, a, button } from '@cycle/dom';
import { makeHistoryDriver, captureClicks } from '@cycle/history';
import { resolve } from 'universal-router';
import makeRouterDriver from './drivers/router';
import routes from './routes';

function main(sources) {
  const page$ = sources.router
    .map(render => render(sources))
    .map(page => page.DOM)
    .flatten()
    .map(pageDOM => div(
      [ a('.navLink', { props: { href: '/' } }, 'HOME')
      , a('.navLink', { props: { href: '/student' } }, 'STUDENTS')
      , a('.navLink', { props: { href: '/student/123?field=name' } }, 'STUDENTS')
      , button('.go', 'GO')
      , h2('Welcome in Engine')
      , pageDOM
      ]
    ))

  return {
    DOM: page$,
    router: sources.history,
    history: sources.DOM.select('.go').events('click').mapTo('/go')
      .startWith(window.location.pathname + window.location.search)
  };
}

const drivers =
  { DOM: makeDOMDriver('#app')
  , history: captureClicks(makeHistoryDriver())
  , router: makeRouterDriver(routes)
  };

const dispose = run(main, drivers);

if (module.hot) {
  module.hot.accept();

  module.hot.dispose(() => {
    dispose();
  });
}
