require = require('esm')(module /* , options */);
require('dotenv').config({ path: '.env' });

module.exports = require('./main');