const Session = require('../../../server/models/session');
const User = require('../../../server/models/user');


class Credentials {
  static authHeader(username, password) {

    const combo = `${username}:${password}`;
    const combo64 = (new Buffer(combo)).toString('base64');

    return `Basic ${combo64}`;
  }

  static async createRootUser() {

    let [user, session] = await Promise.all([
      User.create('root', 'root', 'root@stimpy.show', 'Root user'),
      undefined
    ]);
    const userUpdate = {
      $set: {
        'roles.root': true
      }
    };

    session = await Session.create(`${user._id}`, '127.0.0.1', 'Lab');

    [user] = await Promise.all([
      User.findByIdAndUpdate(user._id, userUpdate)
    ]);

    return {
      scope: Object.keys(user.roles),
      user,
      session
    };
  }

  static async createAdminUser() {

    let [user, session] = await Promise.all([
      User.create('admin', 'admin', 'admin@stimpy.show','Admin User'),
      undefined
    ]);
    const userUpdate = {
      $set: {
        'roles.admin': true
      }
    };

    session = await Session.create(`${user._id}`, '127.0.0.1', 'Lab');

    [user] = await Promise.all([
      User.findByIdAndUpdate(user._id, userUpdate)
    ]);

    return {
      scope: Object.keys(user.roles),
      user,
      session
    };
  }


  static async createResearcherUser() {

    let [user, session] = await Promise.all([
      User.create('researcher', 'researcher', 'Researcher@stimpy.show','Researcher User'),
      undefined
    ]);
    const userUpdate = {
      $set: {
        'roles.researcher': true
      }
    };

    session = await Session.create(`${user._id}`, '127.0.0.1', 'Lab');

    [user] = await Promise.all([
      User.findByIdAndUpdate(user._id, userUpdate)
    ]);

    return {
      scope: Object.keys(user.roles),
      user,
      session
    };
  }


  static async createAnalystUser() {

    let [user, session] = await Promise.all([
      User.create('analyst', 'analyst', 'analyst@stimpy.show','Analyst User'),
      undefined
    ]);
    const userUpdate = {
      $set: {
        'roles.analyst': true
      }
    };

    session = await Session.create(`${user._id}`, '127.0.0.1', 'Lab');

    [user] = await Promise.all([
      User.findByIdAndUpdate(user._id, userUpdate)
    ]);

    return {
      scope: Object.keys(user.roles),
      user,
      session
    };
  }


  static async createClinicianUser() {

    let [user, session] = await Promise.all([
      User.create('clinician', 'clinician', 'clinician@stimpy.show','Clinician User'),
      undefined
    ]);
    const userUpdate = {
      $set: {
        'roles.clinician': {}
      }
    };

    session = await Session.create(`${user._id}`, '127.0.0.1', 'Lab');

    [user] = await Promise.all([
      User.findByIdAndUpdate(user._id, userUpdate)
    ]);

    return {
      scope: Object.keys(user.roles),
      user,
      session
    };
  }


  static async createUser(username, password, email, name) {

    let [user, session] = await Promise.all([
      User.create('root', 'root', 'root@stimpy.show','basic user'),
      undefined
    ]);

    session = await Session.create(`${user._id}`, '127.0.0.1', 'Lab');

    return {
      scope: Object.keys(user.roles),
      user,
      session
    };
  }
}


module.exports = Credentials;
