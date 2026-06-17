const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Do not throw here; allow the app to start without a DB in development if desired.
  console.warn('MONGODB_URI is not set. Database operations will fail without it.');
} else {
  try {
    const displayUri = MONGODB_URI.replace(/:\/\/([^:@\/]+):([^@]+)@/, '://$1:***@');
    console.log(`MongoDB URI detected: ${displayUri}`);
  } catch (e) {
    console.log('MongoDB URI detected');
  }
}

let cached = global._mongo || (global._mongo = { conn: null, promise: null });

async function connectWithRetry(uri, opts = {}, retries = 5) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await mongoose.connect(uri, opts);
    } catch (err) {
      attempt += 1;
      const delay = Math.min(2000 * Math.pow(2, attempt), 30000);
      const jitter = Math.floor(Math.random() * 300);
      const wait = delay + jitter;
      console.warn(`MongoDB connect attempt ${attempt} failed: ${err && err.message ? err.message : err}. Retrying in ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  // final attempt (let error propagate)
  return mongoose.connect(uri, opts);
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: false,
      // recommended for serverless
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = connectWithRetry(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;

  // attach some helpful listeners
  mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection is open');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });

  return cached.conn;
}

module.exports = { connectToDatabase };
