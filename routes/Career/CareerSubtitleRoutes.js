const express = require("express");
const router = express.Router();
const {
  getSubtitle,
  addSubtitle,
  updateSubtitle,
} = require("../../controllers/Career/CareerSubtitleController");

router.get("/subtitle");

router.post("/subtitle");

router.put("/subtitle");

module.exports = router;
