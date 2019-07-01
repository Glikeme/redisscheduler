# Installation

npm i

# Redis

chmod +x ./redis.sh
npm run redis

# Running for testing

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
