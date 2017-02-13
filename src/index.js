import xs from 'xstream';
import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHistoryDriver, captureClicks } from '@cycle/history';
import 'normalize.css/normalize.css';
import 'semantic-ui-css/semantic.min.css';
import makeRouterDriver from './drivers/router';
import makeAuth0Driver from './drivers/auth0';
import makePicklistValuesDriver from './drivers/picklistValues';
import routes from './routes';
import { clientId, domain, options } from './auth0.config';
import './styles.css';
import appLayout from './ui/appLayout';

function main(sources) {
  const logout$ = sources.DOM.select('.logout').events('click')
    .debug(event => event.preventDefault())
    .mapTo('logout');

  const displayLogin = sources.auth0.token$
    .filter(token => !token)
    .map(() => xs.never());

  // sources.auth0.token$.addListener({
  //   next: i => console.log('AUTH0 Token$', i),
  //   error: err => console.error(err),
  //   complete: () => console.log('completed'),
  // })

  const redirectAfterLogin = sources.auth0.on(['authenticated'])
    .map(({ state }) => window.atob(state));

  // sources.auth0.on(['authenticated']).addListener({
  //     next: i => console.log('AUTH0 authenticated event', i),
  //     error: err => console.error(err),
  //     complete: () => console.log('completed'),
  //   })

  const app$ = sources.router
    .map(render => render(sources))
    .map(component => appLayout(sources, component));

  const sinks = sources.auth0.token$
      .filter(token => !!token)
      .mapTo(app$)
      .flatten();

  const page$ = sinks.map(page => page.DOM).flatten();
    // .map(pageDOM => div(
    //   [ a('.navLink', { props: { href: '/' } }, 'HOME')
    //   , a('.navLink', { props: { href: '/student' } }, 'STUDENTS')
    //   , a('.navLink', { props: { href: '/student/123?field=name' } }, 'STUDENTS')
    //   , button('.go', 'GO')
    //   , h2('Welcome in Engine')
    //   , pageDOM
    //   ]
    // ))

  return {
    DOM: page$,
    router: sources.history,
    history: xs.merge(
      redirectAfterLogin,
      sources.DOM.select('.go').events('click').mapTo('/go')
    ).startWith(window.location.pathname + window.location.hash + window.location.search),
    auth0: logout$
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  history: captureClicks(makeHistoryDriver()),
  router: makeRouterDriver(routes),
  auth0: makeAuth0Driver(clientId, domain, options),
  picklistValues: makePicklistValuesDriver(['School'])
};

const dispose = run(main, drivers);

if (module.hot) {
  module.hot.accept();

  module.hot.dispose(() => {
    dispose();
  });
}
