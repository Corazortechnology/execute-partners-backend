const express = require("express");
const router = express.Router();
const {
  getCard,
  addCard,
  updateCard,
} = require("../../controllers/Career/CareerCardController");
router.get("/card", getCard);

router.post("/card", addCard);

router.put("/card", updateCard);

module.exports = router;
