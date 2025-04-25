const morgan = require('morgan');
const logger = require('../config/logger');

// Stream pour diriger les logs HTTP vers Winston
const stream = {
  write: (message) => logger.info(message.trim()),
};

const httpLogger = morgan('combined', { stream });

module.exports = httpLogger;