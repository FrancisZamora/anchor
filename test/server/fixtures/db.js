const Session = require('../../../server/models/session');
const User = require('../../../server/models/user');


class Db {
  static async removeAllData() {

    return await Promise.all([
      Session.deleteMany({}),
      User.deleteMany({})
    ]);
  }
}


module.exports = Db;
