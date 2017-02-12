export const clientId = '6eRUnFnqvHLY878KJ1V8Rc02dXgTWGke';
export const domain = 'quard.auth0.com';
export const options = {
  storageKey: 'id_token',
  lockOptions: {
    container: 'app',
    // autoclose: true,
    allowSignUp: false,
    socialBigButtons: true,
    focusInput: true,
    auth: {
      // redirect: false,
      redirectUrl: `${window.location.origin}/`,
      responseType: 'token',
      params: {
        scope: 'openid user_metadata',
        state: window.btoa(window.location.pathname)
      }
    }
  }
};
