const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

// Load environment variables early
dotenv.config();

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('Node DNS servers set to:', dns.getServers());
} catch (e) {
  console.warn('Could not set DNS servers:', e && e.message ? e.message : e);
}

// Models
const PrayerRequest = require('./models/PrayerRequest');
const Subscriber = require('./models/Subscriber');

const app = express();

// =======================
// DATABASE CONNECTION
// =======================

const { connectToDatabase } = require('./lib/mongodb');

connectToDatabase()
  .then(() => { console.log('MongoDB Connected'); })
  .catch((err) => { console.log('MongoDB Connection Error:', err); });

// API routes
const adminRoutes = require('./routes/admin');
const { adminLogin } = require('./utils/auth');

app.use('/api/admin', adminRoutes);

// auth endpoint for admin login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await adminLogin(email, password);
    res.json({ token });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

// =======================
// MIDDLEWARE
// =======================

app.use(express.json());

app.use(session({
secret: 'church-secret-key',
resave: false,
saveUninitialized: true,
cookie: { secure: false }
}));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// =======================
// VIEW ENGINE
// =======================

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// Cache static assets aggressively; this helps performance on Vercel/static hosting
app.use((req, res, next) => {
  if (req.path.startsWith('/vid/') || req.path.startsWith('/images/') || req.path.startsWith('/css/') || req.path.startsWith('/js/')) {
    // one year for immutable assets
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// =======================
// ROUTES
// =======================

// Home Page
app.get('/', async (req, res) => {
try {
res.render('index');
} catch (error) {
console.error(error);
res.render('404');
}
});

// Prayer Request Route
app.post('/prayer-request', async (req, res) => {
try {

  const { name, email, prayer } = req.body;

  await PrayerRequest.create({ name, email, prayer });

  console.log('Prayer Request Submitted');

  res.redirect('/#prayer');

} catch (error) {

  console.error('Prayer Request Error:', error);

  res.redirect('/#prayer');

}
});

// Newsletter Subscription
app.post('/subscribe', async (req, res) => {
try {

  const { email } = req.body;

  if (email) {
    await Subscriber.create({ email });

    console.log('Subscriber Added');
  }

  res.redirect('/#footer');

} catch (error) {

  console.error('Subscription Error:', error);

  res.redirect('/#footer');

}
});

// About Page
app.get('/about', (req, res) => {
res.render('about');
});

// Admin pages (simple)
app.get('/admin/login', (req, res) => {
  res.render('admin-login', { adminEmail: process.env.ADMIN_EMAIL || '' });
});

app.get('/admin/dashboard', (req, res) => {
  res.render('admin-dashboard');
});

// Sermons Page
app.get('/sermons', (req, res) => {
res.render('sermons');
});

// Events Page
app.get('/events', (req, res) => {
res.render('events');
});

// Contact Page
app.get('/contact', (req, res) => {
res.render('contact');
});

// Donation Page
app.get('/give', (req, res) => {
res.render('give');
});

// =======================
// 404 PAGE
// =======================

app.use((req, res) => {
res.status(404).render('404');
});

// =======================
// SERVER
// =======================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
