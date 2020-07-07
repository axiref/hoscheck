# hoscheck 挂号网 号源提醒

有时候人们生病了（大病）需前往医院复诊，但专家号难以预约，往往不知道何时放号
所以制作了此脚本，如果某医生放号，则立刻会通知

通知内容为该医生最新可预约的日期，如果该日期变动，则收到通知

通知通过钉钉机器人来完成

# 配置

```bash
yarn install # 安装依赖
cp config.js.example config.js # 复制配置文件
```

打开 [挂号网](https://www.guahao.com/) 搜索你的医生，会在页面上看到 *排班*
此时右键网页选择检查，打开开发者工具，切换到*Network*，然后刷新网页
在Filter框中输入 `shiftcase`，将该请求URL复制下来，去掉最后一个参数 `_`

将此URL粘入`config.js`的`url`中

然后配置好钉钉机器人，将钉钉机器人的配置填写在`dingRobot`
以及填写管理员的手机号在`admin`
最后检查Redis配置是否正常，然后运行

```bash
npm run start
```

如无异常钉钉将收到该医生最新可预约时间

然后设置`Crontab`，10分钟运行一次本脚本(`crontab -e`添加):

```bash
*/5 * * * * cd /path-to-your-project && node index.js >> /dev/null 2&1
```


# License

MIT