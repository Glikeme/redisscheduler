const express = require("express");
const { createScheduledMessage } = require("../controllers/scheduleController");
const router = express.Router();

/* POST create scheduled message. */
router.post("/", createScheduledMessage);

module.exports = router;
