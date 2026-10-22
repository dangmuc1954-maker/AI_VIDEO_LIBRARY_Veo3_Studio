const fs = require('fs');
const path = require('path');

try {
  require('./build_locked_customer_edition.js');
} catch (err) {
  console.error('Error running build_locked_customer_edition:', err);
}
