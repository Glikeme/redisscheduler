const redis = require("redis");
const config = require("../config.json");
const uuidv4 = require("uuid/v4");

const UUIDv4_LENGTH = 36;

const MESSAGES_KEY = "messages";
const MESSAGE_STATUS_PREFIX = "messagestatus";
const MESSAGE_TIMESTAMP_CHANNEL = "messagetimestamp";

const client = redis.createClient(config.redis.port, config.redis.host);
const sub = redis.createClient(config.redis.port, config.redis.host);

let serverName = undefined;
let nextTimerId = undefined;
let nextEventTimestamp = Date.now();

const init = function(hostname = "server1") {
  serverName = hostname;
  client.on("error", errorHandler);
  sub.subscribe(MESSAGE_TIMESTAMP_CHANNEL);
  sub.on("message", messageHandler);

  printOldMessages();
  scheduleNextMessage(nextEventTimestamp);
};

const createMessage = function(timestamp = 1000, message = "") {
  const messageId = uuidv4();
  client
    .batch()
    .zadd(MESSAGES_KEY, timestamp, `${messageId}${message}`)
    .publish(MESSAGE_TIMESTAMP_CHANNEL, `${messageId}${timestamp}`)
    .exec(errorHandler);
};

const messageHandler = function(channel, data = "") {
  if (channel === MESSAGE_TIMESTAMP_CHANNEL && data.length > UUIDv4_LENGTH) {
    const messageId = data.slice(0, UUIDv4_LENGTH);
    const timestamp = data.slice(UUIDv4_LENGTH);
    client.set(
      `${MESSAGE_STATUS_PREFIX}:${serverName}:${messageId}`,
      "pending"
    );
    scheduleMessage(timestamp);
  }
};

const scheduleMessage = function(data) {
  const timestamp = +data;
  if (!nextEventTimestamp || nextEventTimestamp > timestamp) {
    nextEventTimestamp = timestamp;
    clearTimer(nextTimerId);
    nextTimerId = setTimeout(printNextMessage, nextEventTimestamp - Date.now());
  }
};

const scheduleNextMessage = function(fromTimestamp) {
  client.zrangebyscore(
    MESSAGES_KEY,
    fromTimestamp,
    "+inf",
    "WITHSCORES",
    function(err, reply) {
      clearNextEventData();
      if (err) {
        return errorHandler(err);
      }

      if (!reply.length) {
        return;
      }

      const [message, timestamp] = reply;
      if (!!timestamp) {
        scheduleMessage(timestamp);
      }
    }
  );
};

const printNextMessage = function() {
  client.zrangebyscore(
    MESSAGES_KEY,
    nextEventTimestamp,
    nextEventTimestamp,
    function(err, results) {
      if (err) {
        return errorHandler(err);
      }

      for (let i = 0; i < results.length; ++i) {
        const message = results[i];
        const messageText = message.slice(UUIDv4_LENGTH);
        printMessage(messageText);
        clearMessageData(message);
      }

      scheduleNextMessage(nextEventTimestamp + 1);
    }
  );
};

const printOldMessages = function() {
  const currentTimestamp = Date.now();
  client.zrangebyscore(MESSAGES_KEY, "-inf", currentTimestamp, function(
    err,
    messages
  ) {
    if (err) {
      return errorHandler(err);
    }

    if (!messages.length) {
      return;
    }

    client.scan(
      0,
      "MATCH",
      `${MESSAGE_STATUS_PREFIX}:${serverName}:*`,
      function(err, reply) {
        if (err) {
          return errorHandler(err);
        }
        const [cursor, keys] = reply;
        if (!keys.length) {
          return;
        }

        const messagesIds = keys.map(function(item) {
          return item.slice(item.length - UUIDv4_LENGTH);
        });
        for (let i = 0; i < messages.length; ++i) {
          const message = messages[i];
          const messageId = message.slice(0, UUIDv4_LENGTH);
          if (messagesIds.includes(messageId)) {
            const messageText = message.slice(UUIDv4_LENGTH);
            printMessage(messageText);
            clearMessageData(message);
          }
        }
      }
    );
  });
};

const clearMessageData = function(message = "") {
  const messageId = message.slice(0, UUIDv4_LENGTH);

  client.del(`${MESSAGE_STATUS_PREFIX}:${serverName}:${messageId}`, function(
    err,
    reply
  ) {
    if (err) {
      return errorHandler(err);
    }
    client.scan(0, "MATCH", `${MESSAGE_STATUS_PREFIX}:*:${messageId}`, function(
      err,
      reply
    ) {
      if (err) {
        return errorHandler(err);
      }
      const [cursor, keys] = reply;
      if (!keys.length) {
        client.zrem(MESSAGES_KEY, message, errorHandler);
      }
    });
  });
};

const printMessage = function(message = "") {
  console.log("MESSAGE: ", message);
};

const errorHandler = function(err) {
  if (err) console.log("Error: ", err);
};

const clearTimer = function(timerId) {
  if (timerId) {
    clearTimeout(timerId);
    nextTimerId = undefined;
  }
};

const clearNextEventData = function() {
  nextEventTimestamp = undefined;
  clearTimer(nextTimerId);
};

module.exports = {
  init,
  createMessage
};
