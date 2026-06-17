const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);
