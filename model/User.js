const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  passwd: {
    type: String,
    required: true
  },
  roles: {
    User: {
      type: Number,
      default: 2001
    },
    Editor: Number,
    Admin: Number
  },
  refreshToken: String
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;

//! The model 'User' is for 'users' collection in the MongoDB.