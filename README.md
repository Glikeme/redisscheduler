# Installation

npm i

# Redis

chmod +x ./redis.sh

npm run redis

# Running for testing

For simulating few servers you can run two (or more) instances of the app

PORT=3000 npm start

PORT=4000 npm start

# Endpoint for testing

POST / HTTP/1.1

Host: localhost:3000

Content-Type: application/json

{

    "timestamp": 1561984173490,

    "message": "Hello, world!"

}

# Running endpoint tests

npm run test

# Timestamp generator

For testing of this app you have to send timestamp.

You can generate it via script timestampgenerator.js

You have to send argument "seconds" that means in how many seconds in the future there should be a timestamp.

node ./timestampGenerator.js 30

# Stress test

- Run redis

- Run few instances of the app

  PORT=3000 npm start

  PORT=4000 npm start

- Run stressTest script

  node ./stressTest.js

- Look at the console.
