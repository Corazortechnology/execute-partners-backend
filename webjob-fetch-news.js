require('dotenv').config();
const mongoose = require('mongoose');
const fetchAndStoreNewsForAllCategories = require('./services/mediumService');

// Add timestamp with UTC indicator
console.log(`[${new Date().toISOString()}] Starting WebJob`);

mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Database connected');
    return fetchAndStoreNewsForAllCategories();
  })
  .then(() => {
    console.log(`[${new Date().toISOString()}] News fetch completed`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`[${new Date().toISOString()}] FAILED:`, err);
    process.exit(1);
  });