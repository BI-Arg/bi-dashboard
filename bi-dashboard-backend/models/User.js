const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  location: {
    type: String,
  },
  // username: {
  //   type: String,
  //   required: true,
  //   unique: true
  // },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  // profilePicture: {
  //   type: String,
  //   default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  // },
  role: {
    type: [String],
    enum: ['admin', 'user', 'gmar', 'gmuy', 'gmcl', 'gmpe', 'gmco'],
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema)