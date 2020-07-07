const config = require('./config')

const ChatBot = require('dingtalk-robot-sender');

const robot = new ChatBot({
  baseUrl: 'https://oapi.dingtalk.com/robot/send',
  ...config.dingRobot
});

module.exports = robot