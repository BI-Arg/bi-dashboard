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
    enum: ['ar', 'cl', 'co', 'ec', 'pe', 'py', 'uy']
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    enum: ['admin', 'user', 'gmar', 'gmec', 'gmuy', 'gmcl', 'gmpe', 'gmco', 'gmpy'],
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema)