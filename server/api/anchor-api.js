'use strict';
const Boom = require('boom');
const Path = require('path');
let models = {};

const internals = {};


internals.applyRoutes = function (server, next) {

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
      }]
    },
    handler: function (request, reply) {

      const query = {};
      const fields = request.query.fields;
      const sort = request.query.sort;
      const limit = request.query.limit;
      const page = request.query.page;

      request.pre.model.pagedFind(query, fields, sort, limit, page, (err, results) => {

        if (err) {
          return reply(err);
        }

        reply(results);
      });

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
