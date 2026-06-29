const serverless = require('serverless-http');
const app = require('../server');

module.exports = serverless(app, {
  binary: ['application/octet-stream', 'image/*'],
});
