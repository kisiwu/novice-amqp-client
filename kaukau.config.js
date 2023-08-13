module.exports = {
  enableLogs: true,
  exitOnFail: true,
  files: 'test/tests',
	ext: '.test.js',
  options: {
    bail: false,
    fullTrace: true,
    grep: '',
    ignoreLeaks: false,
    reporter: 'spec',
    retries: 0,
    slow: 150,
    timeout: 10000,
    ui: 'bdd',
    color: true,
  },
  parameters: {
    // tested with CloudAMQP
    amqp: {
      protocol: process.env.TEST_PROTOCOL || 'amqp',
      hostname: process.env.TEST_HOSTNAME || '192.168.99.100',
      port: process.env.TEST_PORT ? parseInt(process.env.TEST_PORT) : undefined/* || 5672*/,
      username: process.env.TEST_USERNAME || 'guest',
      password: process.env.TEST_PASSWORD || 'guest',
      vhost: process.env.TEST_VHOST || '',
    },
    defaultHeaders: {
      senderPort: 3030,
    },
  },
};
