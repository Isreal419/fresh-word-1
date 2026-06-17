const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  youtubeUrl: { type: String, required: true, trim: true },
  thumbnailUrl: { type: String },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sermon', sermonSchema);
