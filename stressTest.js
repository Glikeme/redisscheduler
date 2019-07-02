const request = require("request");

console.log("Stress Test - START");

const generateTimestamp = function(seconds = 30) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + seconds);
  return +date;
};

const maxSeconds = 100;
const step = 2;
for (let seconds = 5; seconds < maxSeconds; seconds += step)
  request({
    uri: "http://127.0.0.1:3000/",
    method: "POST",
    json: {
      message: `This message should be appeared in ${seconds} seconds.`,
      timestamp: generateTimestamp(seconds)
    }
  });

console.log("Stress Test - END");
