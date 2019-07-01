const messagesService = require("../services/messagesService");

const createScheduledMessage = function(req, res) {
  const { timestamp, message } = req.body;
  messagesService.createMessage(timestamp, message);
  res.sendStatus(200);
};

module.exports = {
  createScheduledMessage
};
