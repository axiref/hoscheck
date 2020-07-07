const config = require('./config')
const client = require('./redis')

for (let i in config.keys) {
    console.log('clear...', config.keys[i]);
    client.del(config.keys[i])
}

console.log('清除redis相关key完成');
setTimeout( () => {
    process.exit(0)
}, 500)