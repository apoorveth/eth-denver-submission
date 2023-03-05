/* eslint-disable global-require */
const ENV = process.env.NODE_ENV;
const logger = require('./log');
logger.info('NODE ENV', { ENV });

if (ENV === 'production') {
  module.exports = require('./config-prod.js');
} else {
  module.exports = require('./config-stage');
}
