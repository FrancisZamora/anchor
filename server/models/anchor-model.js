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
    }, (err, doc) => {

      if (err) {
        return callback(err);
      }

      callback(null, doc);
    });
  }

  static applyDefaultValues(document) {}

  static applyAnchorValues(document) {

    document.createdAt = document.createdAt || new Date();
  }
}
module.exports = AnchorModel;
