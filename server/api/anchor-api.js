'use strict';
const Boom = require('boom');
const Joi = require('joi');
const Path = require('path');
let models = {};

const internals = {};


internals.applyRoutes = function (server, next) {


  server.route({
    method: 'GET',
    path: '/api/{model}/my',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.getMy) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.getMy;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      }]
    },
    handler: function (request, reply) {

      request.pre.model.getMy(request, reply);
    }
  });


  server.route({
    method: 'GET',
    path: '/api/{model}',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.getAll) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.getAll;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      }]
    },
    handler: function (request, reply) {

      request.pre.model.get(request, reply);

    }
  });


  server.route({
    method: 'POST',
    path: '/api/{model}',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.create) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.create;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      }, {
        assign: 'payload',
        method: function (request, reply) {

          const model = request.pre.model;
          Joi.validate(request.payload, model.payload, (err, result) => {

            if (err) {
              return reply(Boom.conflict(err.message));
            }

            reply(true);
          });
        }
      }]
    },
    handler: function (request, reply) {

      const model = request.pre.model;
      const document = request.payload;


      if (model.settings.userId) {
        document.userId = request.auth.credentials.user._id.toString();
      }

      request.pre.model.create(document, (err, result) => {

        if (err) {
          return reply(err);
        }

        reply(result);
      });

    }
  });


  server.route({
    method: 'PUT',
    path: '/api/{model}/my/{id}',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.updateMy) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.updateMy;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      },{
        assign: 'payload',
        method: function (request, reply) {

          const model = request.pre.model;
          Joi.validate(request.payload, model.payload, (err, result) => {

            if (err) {
              return reply(Boom.conflict(err.message));
            }

            reply(true);
          });
        }
      },{
        assign: 'owner',
        method: function (request, reply) {

          const model = request.pre.model;
          model.findById(request.params.id,(err, document) => {

            if (err) {
              return reply(err);
            }

            if (!document) {
              return reply(Boom.notFound('Document not found.'));
            }

            if (document.userId !== document.userId) {
              return reply(Boom.forbidden('Unable to edit this document.'));
            }

            reply(true);
          });
        }
      }]
    },
    handler: function (request, reply) {

      request.pre.model.update(request, reply);

    }
  });


  server.route({
    method: 'PUT',
    path: '/api/{model}/{id}',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.updateAny) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.updateAny;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      },{
        assign: 'payload',
        method: function (request, reply) {

          const model = request.pre.model;
          Joi.validate(request.payload, model.payload, (err, result) => {

            if (err) {
              return reply(Boom.conflict(err.message));
            }

            reply(true);
          });
        }
      }]
    },
    handler: function (request, reply) {

      request.pre.model.update(request, reply);

    }
  });


  server.route({
    method: 'DELETE',
    path: '/api/{model}/my/{id}',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.deleteMy) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.deleteMy;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      },{
        assign: 'payload',
        method: function (request, reply) {

          const model = request.pre.model;
          Joi.validate(request.payload, model.payload, (err, result) => {

            if (err) {
              return reply(Boom.conflict(err.message));
            }

            reply(true);
          });
        }
      },{
        assign: 'owner',
        method: function (request, reply) {

          const model = request.pre.model;
          model.findById(request.params.id,(err, document) => {

            if (err) {
              return reply(err);
            }

            if (!document) {
              return reply(Boom.notFound('Document not found.'));
            }

            if (document.userId !== document.userId) {
              return reply(Boom.forbidden('Unable to edit this document.'));
            }

            reply(true);
          });
        }
      }]
    },
    handler: function (request, reply) {

      request.pre.model.deleteMy(request, reply);

    }
  });


  server.route({
    method: 'DELETE',
    path: '/api/{model}/{id}',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.deleteAny) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.deleteAny;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      }]
    },
    handler: function (request, reply) {

      request.pre.model.delete(request, reply);

    }
  });


  server.route({
    method: 'GET',
    path: '/api/{model}/schema',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.getSchema) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.getSchema;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      }]
    },
    handler: function (request, reply) {

      reply(request.pre.model.schema);

    }
  });


  server.route({
    method: 'GET',
    path: '/api/{model}/payload',
    config: {
      auth: {
        strategies: ['simple', 'jwt', 'session']
      },
      pre: [{
        assign: 'model',
        method: function (request, reply) {

          const path = models[request.params.model];

          if (!path) {

            return reply(Boom.notFound('Model not found'));
          }

          const model = require(Path.join(__dirname,'../..',models[request.params.model]));
          reply(model);
        }
      }, {
        assign: 'enabled',
        method: function (request, reply) {

          const model = request.pre.model;

          if (!model.settings.routes.getPayload) {
            return reply(Boom.notFound('Not Found'));
          }
          reply(true);
        }
      }, {
        assign: 'scope',
        method: function (request, reply) {

          const model = request.pre.model;
          const userScope = request.auth.credentials.user.roles;
          const routeScopes = model.settings.scopes.getPayload;

          if (!routeScopes) {
            return reply(true);
          }

          for (const scope of routeScopes) {
            if (userScope[scope]) {
              return reply(true);
            }
          }

          return reply(Boom.unauthorized('User does not have correct permissions.'));
        }
      }]
    },
    handler: function (request, reply) {

      reply(request.pre.model.payload);

    }
  });

  next();
};

exports.register = function (server, options, next) {

  models = options.models || {};
  server.dependency(['auth', 'hicsail-hapi-mongo-models'], internals.applyRoutes);
  next();

};

exports.register.attributes = {
  name: 'anchor-cron'
};
