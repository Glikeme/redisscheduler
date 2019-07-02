const HttpStatus = require("http-status-codes");
const messagesService = require("../services/messagesService");
const { ERROR_CODES } = require("../common/constants");

const createScheduledMessage = function(req, res) {
  const { timestamp, message } = req.body;

  if (!Number.isInteger(timestamp) || timestamp < 0) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      code: ERROR_CODES.WRONG_PARAMETER,
      message: "timestamp must be a positive integer"
    });
  }
  if (typeof message !== "string" || !message.length) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      code: ERROR_CODES.WRONG_PARAMETER,
      message: "message must not be an empty string"
    });
  }

  messagesService.createMessage(timestamp, message);
  res.sendStatus(200);
};

module.exports = {
  createScheduledMessage
};
