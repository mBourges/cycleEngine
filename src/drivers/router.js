import xs from 'xstream';
import { parse } from 'query-string';
import { resolve } from 'universal-router';

function extractPathAndQuery ({ pathname, search}) {
  return {
    pathname,
    query: parse(search)
  };
}

export default function makeRouterDriver(routes) {
  function getComponent({ pathname }) {
    return xs.fromPromise(resolve(routes, { path: pathname }));
  }

  function routerDriver(history$) {
    const location$ = history$
      .map(extractPathAndQuery)
      .remember();

    const router$ = location$
      .map(getComponent)
      .flatten();

    const params$ = router$
      .map(({ context }) => context.params)
      .remember();

    const component$ = router$
      .map(({ component }) => component)
      .flatten()
      .map(component => component.default);

    const route$ = xs.combine(component$, params$, location$)
      .map(([component, params, { query }]) => {
        return function render(sources) {
          const newSources = {
            ...sources,
            location: {
              params: xs.of(params),
              query: xs.of(query)
            }
          };

          return component(newSources);
        }
      })

    return route$;
  }

  return routerDriver;
}
