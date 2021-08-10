# @novice1/amqp-client

AMQP 0-9-1 client. Sends messages with predefined headers.
Extends [amqplib](https://www.npmjs.com/package/amqplib).

## Installation

```bash
$ npm install @novice1/amqp-client
```

## Usage

publisher.js
```js
const AMQPClient = require('@novice1/amqp-client');

const publisher = new AMQPClient(
  // url
  'amqp://guest:guest@localhost:5672/',
  // socket options
  null,
  // predefined headers for all messages sent
  {
    clientCode: 'guest101'
  }
);

publisher.connect().then((conn) => {
    return conn.createChannel();
  })
  .then((ch) => {
    return ch
      .assertQueue('queue_name', { durable: false })
      .then(function () {
        return ch.sendToQueue(
            'queue_name',
            Buffer.from('message')
          );
      });
  })
  .catch(console.error);
```

consumer.js
```js
const AMQPClient = require('@novice1/amqp-client');

const consumer = new AMQPClient(
  // url
  'amqp://guest:guest@localhost:5672/'
);

consumer.connect().then((conn) => {
    return conn.createChannel();
  })
  .then((ch) => {
    return ch
      .assertQueue('queue_name', { durable: false })
      .then(function () {
        return ch.consume('queue_name', (msg) => {
          let senderIP = msg.properties.headers.senderIP;
          let clientCodeHeader = msg.properties.headers.clientCode;
          let body = msg.content.toString();
          console.log(" [x] Received '%s' from '%s' with clientCode '%s'", body, senderIP clientCodeHeader);
        });
      });
  })
  .catch(console.error);
```

## References
- [amqplib](https://www.npmjs.com/package/amqplib)
- [ip](https://www.npmjs.com/package/ip)
