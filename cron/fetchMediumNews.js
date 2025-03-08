const cron = require("node-cron");
const fetchAndStoreNewsForAllCategories = require("../services/mediumService");

// Schedule the cron job to run every 6 hours
cron.schedule("0 */6 * * *", () => {
  console.log("Fetching and storing news...");
  fetchAndStoreNewsForAllCategories();
});
