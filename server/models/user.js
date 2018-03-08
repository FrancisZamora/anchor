const Assert = require('assert');
const Bcrypt = require('bcrypt');
const Clinician = require('./clinician');
const Joi = require('joi');
const MongoModels = require('mongo-models');
const NewDate = require('joistick/new-date');


const schema = Joi.object({
  _id: Joi.object(),
  email: Joi.string().email().lowercase().required(),
  isActive: Joi.boolean().default(true),
  name: Joi.string().required(),
  password: Joi.string(),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    expires: Joi.date().required()
  }),
  roles: Joi.object({
    clinician: Clinician.schema,
    analyst: Joi.boolean(),
    researcher: Joi.boolean(),
    admin: Joi.boolean(),
    root: Joi.boolean()
  }).default({}),
  timeCreated: Joi.date().default(NewDate(), 'time of creation'),
  username: Joi.string().token().lowercase().required()
});

const payload = Joi.object({
  email: Joi.string().email().lowercase().required(),
  name: Joi.string().required(),
  password: Joi.string(),
  username: Joi.string().token().lowercase().required()
});


class User extends MongoModels {
  static async create(username, password, email, name) {

    Assert.ok(username, 'Missing username argument.');
    Assert.ok(password, 'Missing password argument.');
    Assert.ok(email, 'Missing email argument.');
    Assert.ok(name, 'Missing name argument.');

    const passwordHash = await this.generatePasswordHash(password);
    const document = new this({
      email,
      isActive: true,
      password: passwordHash.hash,
      username,
      name
    });
    const users = await this.insertOne(document);

    users[0].password = passwordHash.password;

    return users[0];
  }

  static async findByCredentials(username, password) {

    Assert.ok(username, 'Missing username argument.');
    Assert.ok(password, 'Missing password argument.');

    const query = { isActive: true };

    if (username.indexOf('@') > -1) {
      query.email = username.toLowerCase();
    }
    else {
      query.username = username.toLowerCase();
    }

    const user = await this.findOne(query);

    if (!user) {
      return;
    }

    const passwordMatch = await Bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return user;
    }
  }

  static findByEmail(email) {

    Assert.ok(email, 'Missing email argument.');

    const query = { email: email.toLowerCase() };

    return this.findOne(query);
  }

  static findByUsername(username) {

    Assert.ok(username, 'Missing username argument.');

    const query = { username: username.toLowerCase() };

    return this.findOne(query);
  }

  static async generatePasswordHash(password) {

    Assert.ok(password, 'Missing password argument.');

    const salt = await Bcrypt.genSalt(10);
    const hash = await Bcrypt.hash(password, salt);

    return { password, hash };
  }

  constructor(attrs) {

    super(attrs);

    Object.defineProperty(this, '_roles', {
      writable: true,
      enumerable: false
    });
  }
}


User.collectionName = 'users';
User.schema = schema;
User.payload = payload;
User.indexes = [
  { key: { username: 1 }, unique: true },
  { key: { email: 1 }, unique: true }
];


module.exports = User;
