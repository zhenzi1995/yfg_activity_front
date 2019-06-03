// config.js
/**
 * 小程序后端接口配置文件
 */
var host = "https://activity.aworld.cn"  //域名要在小程序的管理平台配置好，如果出现调用时报错，无效的域名，可在微信开发工具左边点项目-》配置信息-》看一下配置的域名【request合法域名】有没有刷新下来，没有的话就点下面的刷新

module.exports = {
  url: {
    login: `${host}/wxlogin`,
    profile: `${host}/u/cart`
  }
}

//对外把对象config返回
module.exports = config