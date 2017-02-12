import xs from 'xstream';
import Auth0Lock from 'auth0-lock';
import decode from 'jwt-decode';

function validateToken(storageKey) {
  const token = localStorage.getItem(storageKey);

  if(token && getTokenTimeleft(token) > 0) {
    return token;
  }

  localStorage.removeItem(storageKey);
  return null;
}

function getTokenTimeleft(token) {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  return (decode(token).exp - currentTimestamp) * 1000;
}

function getProfile(lock, token) {
  return new Promise((resolve, reject) => {
    lock.getProfile(token, (err, profile) => {
      if (err) {
        return reject(err);
      }

      return resolve(profile);
    });
  });
}

function createEventStream(event, lock, action$) {
  return xs.create({
    start: (listener) => lock.on(event, (response) => listener.next(response)),
    stop: () => {}
  });
}

function generateSelector(lock, action$) {
  return function onResponse(selectors) {
    const events$ = selectors.map(event => createEventStream(event, lock, action$));

    return xs.merge(...events$);
  };
}

function buildDriver(clientId, domain, options) {
  const lock = new Auth0Lock(clientId, domain, options.lockOptions);
  const localStorage = window.localStorage;
  const location = window.location;
  const storageKey = options.storageKey || 'id_token';
  const on = generateSelector(lock);

  return function auth0Driver(sink$) {
    const initialToken$ = location.hash.indexOf('id_token') !== -1
      ? xs.never()
      : xs.of(validateToken(storageKey));

    const authenticate$ = on(['authenticated']).map(authResult => {
      localStorage.setItem(storageKey, authResult.idToken);

      return authResult.idToken;
    }).debug('authenticate$');

    const autoLoggout = xs.merge(
      initialToken$,
      authenticate$
    ).filter(token => !!token)
    .map(token => {
      const timeleft = getTokenTimeleft(token);

      return xs.periodic(timeleft).take(1);
    }).flatten();

    const removeToken$ = xs.merge(
      sink$.filter(action => action === 'logout'),
      autoLoggout
    ).map(() => {
      localStorage.removeItem(storageKey);

      return null;
    });

    const token$ = xs.merge(
      initialToken$,
      authenticate$,
      removeToken$
    ).map(token => {
      if(token === null) {
        lock.show();
      }

      return token;
    }).remember();

    const profile$ = token$.filter(token => !!token)
      .map(token => xs.fromPromise(getProfile(lock, token)))
      .flatten()
      .startWith(null);

    return {
      on,
      token$,
      profile$
    };
  };
}

export default function makeAuth0Driver(clientId, domain, options = {}) {
  if (!clientId || !domain) {
    throw new Error("[Auth0] You must provide a clientId and a domain");
  }

  return buildDriver(clientId, domain, options);
}
