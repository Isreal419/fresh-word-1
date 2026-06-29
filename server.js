const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables early.
dotenv.config();

// Models
const PrayerRequest = require('./models/PrayerRequest');
const Subscriber = require('./models/Subscriber');

const { connectToDatabase } = require('./lib/mongodb');
const adminRoutes = require('./routes/admin');
const { adminLogin } = require('./utils/auth');

const app = express();

// Trust proxy so cookies and auth behave correctly behind Vercel.
app.set('trust proxy', 1);

// Initialize the database connection once per serverless instance.
connectToDatabase().catch((err) => {
  console.error('MongoDB Connection Error:', err);
});

// Middleware order follows Express best practices.
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  if (
    req.path.startsWith('/vid/') ||
    req.path.startsWith('/images/') ||
    req.path.startsWith('/css/') ||
    req.path.startsWith('/js/')
  ) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/admin', adminRoutes);

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await adminLogin(email, password);
    res.json({ token });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

app.get('/', async (req, res) => {
  try {
    res.render('index');
  } catch (error) {
    console.error(error);
    res.status(500).render('404');
  }
});

app.post('/prayer-request', async (req, res) => {
  try {
    const { name, email, prayer } = req.body;
    await PrayerRequest.create({ name, email, prayer });
    res.redirect('/#prayer');
  } catch (error) {
    console.error('Prayer Request Error:', error);
    res.redirect('/#prayer');
  }
});

app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      await Subscriber.create({ email });
    }
    res.redirect('/#footer');
  } catch (error) {
    console.error('Subscription Error:', error);
    res.redirect('/#footer');
  }
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/sermons', (req, res) => {
  res.render('sermons');
});

app.get('/events', (req, res) => {
  res.render('events');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/give', (req, res) => {
  res.render('give');
});

app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 6000;

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
