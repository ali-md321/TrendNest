const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: String },
  addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const baseOptions = {
  discriminatorKey: 'role',
  collection: 'users',
  timestamps: true,
};

const BaseUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone: {
    type: String,
    validate: {
      validator: v => /^\d{10}$/.test(v),
      message: 'Phone must be 10 digits.'
    },
    unique: true,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    required: true
  },
  addresses: [addressSchema],
}, baseOptions);

BaseUserSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', BaseUserSchema);
