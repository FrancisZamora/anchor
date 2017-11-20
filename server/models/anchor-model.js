'use strict';
const Joi = require('joi');
const Async = require('async');
const MongoModels = require('hicsail-mongo-models');

class AnchorModel extends MongoModels {

  static create() {

    const self = this;
    const args = new Array(arguments.length);
    const callback = args.pop();
    const document = args.shift();

    if (!document.createdAt){
      document.createdAt = new Date();
    }

    Async.auto({
      validate: function (done) {

        Joi.validate(document, this.schema, done);
      },
      insert: ['validate', function (results, done) {

        self.insertOne(document,done);
      }]
    }, (err, doc) => {

      if (err) {
        return callback(err);
      }

      callback(null, doc);
    });
  }
}
module.exports = AnchorModel;
