const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../lib/cloudinary');
const { authenticateAdmin } = require('../utils/auth');

const Sermon = require('../models/Sermon');
const Event = require('../models/Event');
const Story = require('../models/Story');
const PrayerRequest = require('../models/PrayerRequest');
const Subscriber = require('../models/Subscriber');

const upload = multer();

// CRUD Sermons
router.get('/sermons', authenticateAdmin, async (req, res) => {
  const list = await Sermon.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post('/sermons', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, youtubeUrl, featured } = req.body;
  let thumbnailUrl;
  if (req.file) {
    const stream = cloudinary.uploader.upload_stream({ folder: 'sermons' }, (error, result) => {
      if (error) return res.status(500).json({ error });
      thumbnailUrl = result.secure_url;
    });
    streamifier.createReadStream(req.file.buffer).pipe(stream);
    // small delay to ensure result - in production, better handle via callback
    await new Promise(r => setTimeout(r, 800));
  }
  const created = await Sermon.create({ title, youtubeUrl, thumbnailUrl, featured: !!featured });
  res.json(created);
});

// CRUD Events
router.get('/events', authenticateAdmin, async (req, res) => {
  const list = await Event.find().sort({ date: 1 });
  res.json(list);
});

router.post('/events', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, description, date, location } = req.body;
  let imageUrl;
  if (req.file) {
    const stream = cloudinary.uploader.upload_stream({ folder: 'events' }, (error, result) => {
      if (error) return res.status(500).json({ error });
      imageUrl = result.secure_url;
    });
    streamifier.createReadStream(req.file.buffer).pipe(stream);
    await new Promise(r => setTimeout(r, 800));
  }
  const created = await Event.create({ title, description, date: new Date(date), location, imageUrl });
  res.json(created);
});

// Stories
router.get('/stories', authenticateAdmin, async (req, res) => {
  const list = await Story.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post('/stories', authenticateAdmin, upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  let imageUrl;
  if (req.file) {
    const stream = cloudinary.uploader.upload_stream({ folder: 'stories' }, (error, result) => {
      if (error) return res.status(500).json({ error });
      imageUrl = result.secure_url;
    });
    streamifier.createReadStream(req.file.buffer).pipe(stream);
    await new Promise(r => setTimeout(r, 800));
  }
  const created = await Story.create({ title, content, imageUrl });
  res.json(created);
});

// Prayer Requests
router.get('/prayer-requests', authenticateAdmin, async (req, res) => {
  const list = await PrayerRequest.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post('/prayer-requests/:id/mark-handled', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = await PrayerRequest.findByIdAndUpdate(id, { handled: true }, { new: true });
  res.json(updated);
});

// Subscribers
router.get('/subscribers', authenticateAdmin, async (req, res) => {
  const list = await Subscriber.find().sort({ createdAt: -1 });
  res.json(list);
});

module.exports = router;
