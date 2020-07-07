const config = require('./config')
const redis = require('redis')
const bot = require('./bot')
const client = require('./redis')
const https = require('https')

class HosCheck
{
    constructor (cb) {
        this.cb = cb
    };
    getContent () {
        return new Promise((resolve, reject) => {
            https.get(config.url, (resp) => {
              let data = '';
              resp.on('data', (chunk) => {
                data += chunk;
              });
              resp.on('end', () => {
                resolve(JSON.parse(data))
              });
            }).on("error", (err) => {
              console.warn("Error: " + err.message);
              reject(err)
            })
        })
    };
    async getContentCache () {
        let rds = await this.getRedis(config.keys.content);
        if (rds) {return JSON.parse(rds); }
        let resp = await this.getContent()
        if (!resp.hasError) {
            this.setRedis(config.keys.content, resp)
            this.setRedisExpire(config.keys.content, 600);
            return resp;
        }
        throw {msg: "获取内容失败", resp}
    };
    getRedis (key) {
        return new Promise((resolve, reject) => {
            client.get(key, (err, res) => {
                resolve(res)
            })
        })
    };
    setRedis (key, content) {
        let res = typeof content == 'object' ? JSON.stringify(content) : content;
        client.set(key, res);
    };
    setRedisExpire (key, sec) {
        client.expire(key, sec);
    };
    async getLastDate () {
        let resp = await this.getContentCache();
        let shiftSchedule = resp.data.shiftSchedule
        let lastSchedule = shiftSchedule[shiftSchedule.length - 1]
        let lastDate = lastSchedule.date;
        return lastDate
    };
    async check () {
        let lastDate = await this.getLastDate();
        let lastDateRedis = await this.getRedis(config.keys.lastDate)
        if (lastDate != lastDateRedis) {
            this.setRedis(config.keys.lastDate, lastDate);
            return this.cb(lastDate);
        }
        return true;
    };
    sendDateNotice (date) {
        return bot.send({
          "msgtype": "text", 
          "text": {
            "content": `您关注的医生可预约 ${date} 的号，请尽快完成预约`
          }, 
          "at": {
            "atMobiles": [
              config.admin, 
            ], 
            "isAtAll": false
          }
        })
    };
}

const hc = new HosCheck(date => {
    return hc.sendDateNotice(date)
})

hc.check().then(() => {
    setTimeout( () => {
        process.exit(0)
    }, 3000)
});
