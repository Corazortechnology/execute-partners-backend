const express = require("express");
const { getQuote, editQuote } = require("../../controllers/Home/quoteController");
const router = express.Router();

router.get("/quote", getQuote);
router.put("/quote", editQuote);

module.exports = router;
