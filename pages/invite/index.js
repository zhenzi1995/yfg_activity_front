
import {
  URL
} from '../../utils/urlModel';
const moment = require('../../moment.min.js');
//获取应用实例
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topImg: [
      'https://img.aworld.cn/zteam1.jpg',
      'https://img.aworld.cn/zteam2.jpg',
      'https://img.aworld.cn/zteam3.jpg',
      'https://img.aworld.cn/zteam4.jpg',
      'https://img.aworld.cn/zteam5.jpg',
      'https://img.aworld.cn/zteam6.jpg'
    ],
    headimg: '',
    token: "",
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    countDownDay: 0,
    huodong: {},
    teamData: {},
    huodongNext: {},
    title:'',
    teamTitle: ""//团队标题
  },
  onLoad(options) {
    wx.setStorageSync('key', 111111)
    // 随机显示图片
    var randomImg = wx.getStorageSync("randomImg");
    if (!randomImg) {
      randomImg = this.data.topImg[Math.floor(Math.random() * this.data.topImg.length)];
      wx.setStorageSync("randomImg", randomImg)
    }
    this.setData({
      headimg: randomImg
    })
    wx.showShareMenu({
      withShareTicket: true
    }); 
    this.setData({
      token: wx.getStorageSync("token")
    });
    var that = this;
    app.startTimer();
    wx.request({
      url: 'https://activity.aworld.cn/huodong',
      method: 'get',
      success: function (res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            huodong: res.data,
            huodongNext: res.next || {}
          });
        }
        app.globalData.timer.callback = function(){
          that.setPageTime(that.data.huodong.start_time)
        };
        that.getTeam();
      }
    })
    // 随机显示图片
    var randomImg = wx.getStorageSync("randomImg");
    if (!randomImg){
      var randomImg = this.data.topImg[Math.floor(Math.random() * this.data.topImg.length)];
      wx.setStorageSync("randomImg", randomImg)
    }
    //最后就直接可以在分享中调用
    this.setData({
      headimg: randomImg
    })
    //根据scene判断是否为邀请者还是被邀请者。1为邀请者，2为被邀请者。
    // if (options.scene == 2) {//如果为2，则表示该页面来自转发
    //   this.show();
    // }
  },
  setPageTime: function(datetime){
    var that = this;
    // 时间格式2019-2-1 14：00：00
    var nowTime = moment(); // 当前时间
    var sTime = moment(datetime); // 活动开始时间
    var du = moment(nowTime - sTime);
    var qq = moment.duration(sTime.diff(nowTime));
    var countDown = {
      countDownDay: parseInt(qq.asDays()),
      countDownHour: parseInt(qq.asHours(), 10), //时
      countDownMinute: parseInt(qq.asMinutes()) % 60, // 分
      countDownSecond: parseInt(qq.asSeconds()) % 60, // 秒
    }
    if (countDown.countDownDay <= 0 && countDown.countDownHour <= 0 && countDown.countDownMinute <= 0 && countDown.countDownSecond <= 0 && that.data.huodong.id !== 0 ) {
      var countDown = {
        countDownDay: 0,
        countDownHour: 0, //时
        countDownMinute: 0, // 分
        countDownSecond: 0, // 秒
      }
      app.clearTimer();
      wx.redirectTo({
        url: '/pages/game/index',
      })
    }
    that.setData(countDown);
  },
  onUnload: function () {
    app.clearTimer();
  },
  // 获取团队
  getTeam: function () {
    var that = this;
    wx.request({
      url: URL.TEAM + "?create=1&huodong_id=" + that.data.huodong.id,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': that.data.token
      }, // 设置请求的 header
      success: res => {
        res = res.data;
        if (res.errno === 0){
          that.setData({
            teamData: res.data,
          });
          app.globalData.title = res.data.title
        }
      }
    })
  },
  inputTitle: function(e){
    var title = e.detail.value
    wx.request({
      url: URL.TEAM,
      method: 'put',
      data: {
        id: this.data.teamData.id,
        title: title
      },
      header: {
        'content-type': 'application/json',
        'Authorization': this.data.token
      }
    })
    wx.setStorageSync('teamTitle', title);
    this.setData({
      teamTitle: title
    });
  },
  surename: function(){
    if (wx.getStorageSync('teamTitle')){
      this.setData({
        "teamData.title": this.data.teamTitle
      });
    }
    this.setData({
      "teamData.title": this.data.teamTitle
    });
    
  },
  onShareAppMessage: function (ops) {
    var that = this;
    this.setData({
      showShare: false,
      showNoShare: false,
      showTip: false,
      showPrize: false
    });
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      var title = "端午五人龙舟挑战赛，组队拿奖金5000元≥≥";
    }
    return {
      title: title,
      path: '/pages/beinvited/beinvited?huodong_id=' + this.data.huodong.id + '&teamid=' + this.data.teamData.id + "&invite_id=" + this.data.teamData.meuid,
      complete: function (res) {
        // 不管成功失败都会执行
        console.log(res + '失败');
      },
      success: function (ops) {
        console.log(ops)
        that.onLoad()
        wx.getShareInfo({
          success: function (ops) {
            console.log(ops);
            that.onLoad()
          },
          fail: function (ops) {
          }
        })
      }
    }
  },
  createPoster() {
    wx.navigateTo({
      url: '/pages/poster/index'
    })
  },
  black(){
    wx.redirectTo({
      url: '/pages/index/index'
    })
  }
})