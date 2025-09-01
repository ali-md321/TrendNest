const BaseUser = require('./BaseUserModel');
const mongoose = require('mongoose');

module.exports = BaseUser.discriminator('Admin', new mongoose.Schema({
  employeeId: { type: String, required: true },
  department: {
    type: String,
    enum: ['Product Management', 'User Control', 'Support', 'Finance']
  },
  accessLevel: {
    type: String,
    enum: ['Super Admin', 'Manager', 'Support Agent']
  },
  permissions: [String],
  notifications: [{
    type: {
      type: String,
      enum: ['Info', 'Alert', 'Warning']
    },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
}));
