const Config = require('../config');
const Session = require('./models/session');
const User = require('./models/user');


const register = function (server, options) {

  server.auth.strategy('simple', 'basic', {
    validate: async function (request, sessionId, key, h) {

      const session = await Session.findByCredentials(sessionId, key);

      if (!session) {
        return { isValid: false };
      }

      session.updateLastActive();

      const user = await User.findById(session.userId);

      if (!user) {
        return { isValid: false };
      }

      if (!user.isActive) {
        return { isValid: false };
      }

      const roles = await user.hydrateRoles();
      const credentials = {
        scope: Object.keys(user.roles),
        roles,
        session,
        user
      };

      return { credentials, isValid: true };
    }
  });


  server.auth.strategy('session', 'cookie', {
    password: Config.get('/cookieSecret'),
    cookie: 'AuthCookie',
    isSecure: false,
    clearInvalid: true,
    keepAlive: true,
    ttl: 60000 * 30, //30 Minutes
    redirectTo: '/login',
    appendNext: 'returnUrl',
    validateFunc: async function (request, sessionId, key, h) {

      const session = await Session.findByCredentials(sessionId, key);

      if (!session) {
        return { isValid: false };
      }

      session.updateLastActive();

      const user = await User.findById(session.userId);

      if (!user) {
        return { isValid: false };
      }

      if (!user.isActive) {
        return { isValid: false };
      }

      const roles = await user.hydrateRoles();
      const credentials = {
        scope: Object.keys(user.roles),
        roles,
        session,
        user
      };

      return { credentials, isValid: true };
    }
  });
};


module.exports = {
  name: 'auth',
  dependencies: [
    'hapi-auth-basic',
    'hapi-auth-cookie',
    'hapi-mongo-models'
  ],
  register
};
