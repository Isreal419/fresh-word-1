const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
