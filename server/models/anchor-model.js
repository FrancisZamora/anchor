'use strict';
const Joi = require('joi');
const Async = require('async');
const MongoModels = require('hicsail-mongo-models');

class AnchorModel extends MongoModels {

  static create(document, callback) {

    const self = this;

    self.applyDefaultValues(document);

    Async.auto({
      validate: function (done) {

        Joi.validate(document, self.schema, done);
      },
      insert: ['validate', function (results, done) {

        self.applyAnchorValues(document);
        self.insertOne(document,done);
      }]
    }, (err, result) => {

      if (err) {
        return callback(err);
      }

      callback(null, result.insert[0]);
    });
  }


  static get(request, reply) {

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

  static applyDefaultValues(document) {}

  static applyAnchorValues(document) {

    document.createdAt = document.createdAt || new Date();
  }
}
module.exports = AnchorModel;
