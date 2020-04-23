const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const User = (module.exports = mongoose.model('User', UserSchema));

module.exports.getUserByPhone = (phone, callback) => {
  const query = { phone };
  User.findOne(query, callback);
};

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
};

module.exports.updateUser = (id, newData, callback) => {
  User.findByIdAndUpdate(
    id,
    newData,
    { new: true, useFindAndModify: false },
    callback
  );
};

module.exports.addUser = (newUser, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.comparePass = (clientPass, dbPass, callback) => {
  bcrypt.compare(clientPass, dbPass, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};