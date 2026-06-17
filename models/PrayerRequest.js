const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  prayer: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  handled: { type: Boolean, default: false }
});

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
