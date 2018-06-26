'use strict';
const Hoek = require('hoek');
const Joi = require('joi');
const Mongodb = require('mongodb');

const argsFromArguments = function (argumentz) {

  const args = new Array(argumentz.length);

  for (let i = 0; i < args.length; ++i) {
    args[i] = argumentz[i];
  }

  return args;
};


const dbFromArgs = function (args) {

  let db = AnchorModel.dbs.default;

  if (args[0] instanceof Mongodb.Db) {
    db = args.shift();
  }

  return db;
};


class AnchorModel {
  constructor(data) {

    const result = this.constructor.validate(data);

    if (result.error) {
      throw result.error;
    }

    Object.assign(this, result.value);
  }


  static aggregate() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);

    return collection.aggregate.apply(collection, args).toArray();
  }


  static collection() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);

    return db.collection(this.collectionName);
  }


  static async connect(connection, options = {}, name = 'default') {

    const client = await Mongodb.MongoClient.connect(connection.uri, options);

    AnchorModel.clients[name] = client;
    AnchorModel.dbs[name] = client.db(connection.db);

    return AnchorModel.dbs[name];
  }


  static count() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);

    return collection.count.apply(collection, args);
  }


  static createIndexes() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);

    return collection.createIndexes.apply(collection, args);
  }


  static deleteMany() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);

    return collection.deleteMany.apply(collection, args);
  }


  static deleteOne() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);

    return collection.deleteOne.apply(collection, args);
  }


  static disconnect(name) {

    if (name === undefined) {
      Object.keys(AnchorModel.dbs).forEach((key) => {

        delete AnchorModel.dbs[key];

        AnchorModel.clients[key].close();
      });

      return;
    }

    if (!AnchorModel.dbs.hasOwnProperty(name)) {
      throw new Error(`Db connection '${name}' not found.`);
    }

    delete AnchorModel.dbs[name];

    AnchorModel.clients[name].close();
  }


  static distinct() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);

    return collection.distinct.apply(collection, args);
  }


  static fieldsAdapter(fields) {

    if (Object.prototype.toString.call(fields) === '[object String]') {
      const document = {};

      fields = fields.split(/\s+/);
      fields.forEach((field) => {

        if (field) {
          const include = field[0] === '-' ? false : true;
          if (!include) {
            field = field.slice(1);
          }
          document[field] = include;
        }
      });

      fields = document;
    }

    return fields;
  }


  static async find() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const result = await collection.find.apply(collection, args).toArray();

    return this.resultFactory(result);
  }


  static async findById() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const id = args.shift();
    const filter = { _id: this._idClass(id) };

    args.unshift(filter);

    const result = await collection.findOne.apply(collection, args);

    return this.resultFactory(result);
  }


  static async findByIdAndDelete() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const id = args.shift();
    const filter = { _id: this._idClass(id) };
    const options = Hoek.applyToDefaults({}, args.pop() || {});
    const result = await collection.findOneAndDelete(filter, options);

    return this.resultFactory(result);
  }


  static async findByIdAndUpdate() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const id = args.shift();
    const update = args.shift();
    const defaultOptions = {
      returnOriginal: false
    };
    const options = Hoek.applyToDefaults(defaultOptions, args.pop() || {});
    const filter = { _id: this._idClass(id) };
    const result = await collection.findOneAndUpdate(filter, update, options);

    return this.resultFactory(result);
  }


  static async findOne() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const result = await collection.findOne.apply(collection, args);

    return this.resultFactory(result);
  }


  static async findOneAndDelete() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const result = await collection.findOneAndDelete.apply(collection, args);

    return this.resultFactory(result);
  }


  static async findOneAndReplace() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const filter = args.shift();
    const doc = args.shift();
    const defaultOptions = {
      returnOriginal: false
    };
    const options = Hoek.applyToDefaults(defaultOptions, args.pop() || {});

    args.push(filter);
    args.push(doc);
    args.push(options);

    const result = await collection.findOneAndReplace.apply(collection, args);

    return this.resultFactory(result);
  }


  static async findOneAndUpdate() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const filter = args.shift();
    const doc = args.shift();
    const defaultOptions = {
      returnOriginal: false
    };
    const options = Hoek.applyToDefaults(defaultOptions, args.pop() || {});

    args.push(filter);
    args.push(doc);
    args.push(options);

    const result = await collection.findOneAndUpdate.apply(collection, args);

    return this.resultFactory(result);
  }


  static async insertMany() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const result = await collection.insertMany.apply(collection, args);

    return this.resultFactory(result);
  }


  static async insertOne() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const result = await collection.insertOne.apply(collection, args);

    return this.resultFactory(result);
  }


  static async pagedFind() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const filter = args.shift();
    const page = args.shift();
    const limit = args.shift();
    const options = args.pop() || {};

    const output = {
      data: undefined,
      pages: {
        current: page,
        prev: 0,
        hasPrev: false,
        next: 0,
        hasNext: false,
        total: 0
      },
      items: {
        limit,
        begin: ((page * limit) - limit) + 1,
        end: page * limit,
        total: 0
      }
    };
    const findOptions = Object.assign({}, options, {
      limit,
      skip: (page - 1) * limit
    });
    const [count, results] = await Promise.all([
      this.count(db, filter),
      this.find(db, filter, findOptions)
    ]);

    output.data = results;
    output.items.total = count;
    output.pages.total = Math.ceil(output.items.total / limit);
    output.pages.next = output.pages.current + 1;
    output.pages.hasNext = output.pages.next <= output.pages.total;
    output.pages.prev = output.pages.current - 1;
    output.pages.hasPrev = output.pages.prev !== 0;

    if (output.items.begin > output.items.total) {
      output.items.begin = output.items.total;
    }

    if (output.items.end > output.items.total) {
      output.items.end = output.items.total;
    }

    return output;
  }


  static async replaceOne() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const filter = args.shift();
    const doc = args.shift();
    const options = Hoek.applyToDefaults({}, args.pop() || {});

    args.push(filter);
    args.push(doc);
    args.push(options);

    const result = await collection.replaceOne.apply(collection, args);

    return this.resultFactory(result);
  }


  static resultFactory(result) {

    if (Object.prototype.toString.call(result) === '[object Array]') {
      result.forEach((item, index) => {

        result[index] = new this(item);
      });
    }

    if (Object.prototype.toString.call(result) === '[object Object]') {
      if (result.hasOwnProperty('value') && !result.hasOwnProperty('_id')) {
        if (result.value) {
          result = new this(result.value);
        }
        else {
          result = undefined;
        }
      }
      else if (result.hasOwnProperty('ops')) {
        result.ops.forEach((item, index) => {

          result.ops[index] = new this(item);
        });

        result = result.ops;
      }
      else if (result.hasOwnProperty('_id')) {
        result = new this(result);
      }
    }

    return result;
  }


  static sortAdapter(sorts) {

    if (Object.prototype.toString.call(sorts) === '[object String]') {
      const document = {};

      sorts = sorts.split(/\s+/);
      sorts.forEach((sort) => {

        if (sort) {
          const order = sort[0] === '-' ? -1 : 1;
          if (order === -1) {
            sort = sort.slice(1);
          }
          document[sort] = order;
        }
      });

      sorts = document;
    }

    return sorts;
  }


  static async updateMany() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const filter = args.shift();
    const update = args.shift();
    const options = Hoek.applyToDefaults({}, args.pop() || {});

    args.push(filter);
    args.push(update);
    args.push(options);

    const result = await collection.updateMany.apply(collection, args);

    return this.resultFactory(result);
  }


  static async updateOne() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const collection = db.collection(this.collectionName);
    const filter = args.shift();
    const update = args.shift();
    const options = Hoek.applyToDefaults({}, args.pop() || {});

    args.push(filter);
    args.push(update);
    args.push(options);

    const result = await collection.updateOne.apply(collection, args);

    return this.resultFactory(result);
  }


  static async lookup() {

    const args = argsFromArguments(arguments);
    const filter = args.shift();
    const lookups = args.pop();
    const options = args.shift();
    const lookupDefaults  = {
      from: this,
      options: {},
      operator: '$eq',
      lookups: []
    };

    const localDocuments = await this.find(filter,options);

    for (const doc of localDocuments) {
      for (let lookup of lookups) {

        lookup = Hoek.applyToDefaults(lookupDefaults,lookup);

        const foreignFilter = {};
        foreignFilter[lookup.foreign] = {};
        if (lookup.foreign === '_id') {
          foreignFilter[lookup.foreign][lookup.operator] = this.ObjectId(doc[lookup.local]);
        }
        else {
          foreignFilter[lookup.foreign][lookup.operator] = doc[lookup.local];
        }
        let foreignDocs = await lookup.from.lookup(foreignFilter, lookup.options, lookup.lookups);
        if (foreignDocs.length === 0) {
          foreignDocs = null;
        }
        else if (foreignDocs.length === 1) {
          foreignDocs = foreignDocs[0];
        }
        doc[lookup.as] = foreignDocs;

      }
    }

    return localDocuments;
  }


  static async lookupById() {

    const args = argsFromArguments(arguments);
    const id = args.shift();
    const lookups = args.pop() || [];
    const options = args.pop() || {};
    const filter = { _id: this._idClass(id) };

    const result = await this.lookup(filter,options, lookups);
    return result[0];
  }


  static async lookupOne() {

    const args = argsFromArguments(arguments);
    const filter = args.shift();
    const lookups = args.pop() || [];
    const options = args.pop() || {};

    const result = await this.lookup(filter,options, lookups);
    return result[0];
  }


  static async pagedLookup() {

    const args = argsFromArguments(arguments);
    const db = dbFromArgs(args);
    const filter = args.shift();
    const page = args.shift();
    const limit = args.shift();
    const lookups = args.pop() || [];
    const options = args.pop() || {};

    const output = {
      data: undefined,
      pages: {
        current: page,
        prev: 0,
        hasPrev: false,
        next: 0,
        hasNext: false,
        total: 0
      },
      items: {
        limit,
        begin: ((page * limit) - limit) + 1,
        end: page * limit,
        total: 0
      }
    };
    const findOptions = Object.assign({}, options, {
      limit,
      skip: (page - 1) * limit
    });
    const [count, results] = await Promise.all([
      this.count(db, filter),
      this.lookup(filter, findOptions, lookups)
    ]);

    output.data = results;
    output.items.total = count;
    output.pages.total = Math.ceil(output.items.total / limit);
    output.pages.next = output.pages.current + 1;
    output.pages.hasNext = output.pages.next <= output.pages.total;
    output.pages.prev = output.pages.current - 1;
    output.pages.hasPrev = output.pages.prev !== 0;

    if (output.items.begin > output.items.total) {
      output.items.begin = output.items.total;
    }

    if (output.items.end > output.items.total) {
      output.items.end = output.items.total;
    }

    return output;
  }


  static validate(input) {

    return Joi.validate(input, this.schema);
  }


  validate() {

    return Joi.validate(this, this.constructor.schema);
  }


  static with(name) {

    if (!AnchorModel.dbs.hasOwnProperty(name)) {
      throw new Error(`Db connection '${name}' not found.`);
    }

    const db = AnchorModel.dbs[name];
    const boundFunctionsId = `__MongoModelsDbBound${this.name}__`;

    if (!db.hasOwnProperty(boundFunctionsId)) {
      db[boundFunctionsId] = {
        aggregate: this.aggregate.bind(this, db),
        collection: this.collection.bind(this, db),
        count: this.count.bind(this, db),
        createIndexes: this.createIndexes.bind(this, db),
        deleteMany: this.deleteMany.bind(this, db),
        deleteOne: this.deleteOne.bind(this, db),
        distinct: this.distinct.bind(this, db),
        find: this.find.bind(this, db),
        findById: this.findById.bind(this, db),
        findByIdAndDelete: this.findByIdAndDelete.bind(this, db),
        findByIdAndUpdate: this.findByIdAndUpdate.bind(this, db),
        findOne: this.findOne.bind(this, db),
        findOneAndDelete: this.findOneAndDelete.bind(this, db),
        findOneAndReplace: this.findOneAndReplace.bind(this, db),
        findOneAndUpdate: this.findOneAndUpdate.bind(this, db),
        insertMany: this.insertMany.bind(this, db),
        insertOne: this.insertOne.bind(this, db),
        lookup: this.lookup.bind(this, db),
        lookupById: this.lookupById.bind(this, db),
        lookupOne: this.lookupOne.bind(this, db),
        pagedFind: this.pagedFind.bind(this, db),
        pagedLookup: this.pagedLookup.bind(this, db),
        replaceOne: this.replaceOne.bind(this, db),
        updateMany: this.updateMany.bind(this, db),
        updateOne: this.updateOne.bind(this, db)
      };
    }

    return db[boundFunctionsId];
  }
}


AnchorModel._idClass = Mongodb.ObjectID;
AnchorModel.ObjectId = AnchorModel.ObjectID = Mongodb.ObjectID;
AnchorModel.clients = {};
AnchorModel.dbs = {};


module.exports = AnchorModel;
