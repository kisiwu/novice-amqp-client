module.exports = {
	"enableLogs": true,
	"exitOnFail": true,
	"directory": "test/tests",
	"options": {
		"bail": false,
		"fullTrace": true,
		"grep": "",
		"ignoreLeaks": false,
		"reporter": "spec",
		"retries": 0,
		"slow": 150,
		"timeout": 10000,
		"ui": "bdd",
		"color": true
	},
	"parameters": {
		"amqp": {
	    "protocol": process.env.TEST_PROTOCOL || "amqp",
      "hostname": process.env.TEST_HOSTNAME || "192.168.99.100",
      "port": process.env.TEST_PORT || 5672,
      "username": process.env.TEST_USERNAME || "guest",
			"password": process.env.TEST_PASSWORD || "guest",
			"vhost": process.env.TEST_VHOST || ""
		},
		"defaultHeaders": {
			"senderPort": 3030
		}
	}
};