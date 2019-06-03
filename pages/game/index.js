var app = getApp(); // pages/beinvited.js
const moment = require('../../moment.min.js');
const io = require('../../socket-io.min.js');
import {
  URL
} from '../../utils/urlModel';
let client = null;
client = io(URL.SOCKETURL)
Page({
  data: {
    typeName: '倒计时',
    score: 0,
    time: 0,
    owntotal: 0,
    total: 0,
    botstyle: 140,
    animationData: '',
    imgheight: 0,
    windowHeight: wx.getSystemInfoSync().windowHeight,
    differ: 0,
    imgUrls: [
      '../../images/game_bg.png',
      '../../images/game_bg.png'
    ],
    autoplay: true,
    interval: 0,
    duration: 500,
    vertical: true,
    circular: true,
    skiphiddenitemlayout: true,
    x: 0,
    ship: 0,
    shipmishu: 0,
    showView: false,
    stormtime: 3,
    suiji: 0,
    clicktrue: false,
    scrollTop: 0,
    showModal: false, // 弹框
    rankList: {},
    obstacleId: 0,
    acceleratorCount: 0,
    totlename: 0,
    hdid: 0,
    huodong: {},
    delayTime: 10,
    isDuobi: false,
    isJiasu: false,
    shiphead: '',
    jiangjin: {},
    rank: 0,
    teamMoney: 0,
    userMoney: 0
  },
  timeInterval: function() {
    var that = this;
    // 判断是否小于0
    var nowTime = moment().format("X"); // 当前时间
    var eTime = moment(that.data.huodong.end_time).format("X"); // 活动结束时间
    that.setData({
      time: eTime > nowTime ? eTime - nowTime : 0
    })
    if (that.data.time <= 0) {
      app.clearTimer("gameTimer");
      // 秒数等于O时
      that.setData({
        showModal: true
      })
      client.emit('message', {
        handle: 'jiangli',
        authorization: wx.getStorageSync("token"),
        huodong_id: that.data.hdid
      });
    }
  },
  // 狂风显示倒计时
  // 加载倒计时
  onLoad: function() {
    this.setData({
      shiphead: wx.getStorageSync("randomImg")
    })
    var that = this;
    var flag = false;
    wx.setNavigationBarTitle({
      title: that.data.typeName
    });
    this.getHeight();
    this.getHuodong(function(res) {
      if (res.errno !== 0) {
        wx.showModal({
          title: '提示',
          content: '活动未开始',
          showCancel: false,
          success(res) {
            wx.navigateBack()
          }
        })
        return;
      }
      that.setData({
        huodong: res.data,
        hdid: res.data.id
      });
      app.startTimer("gameTimer");
      app.globalData.gameTimer.callback = ()=>{
        that.timeInterval();
      }
      client.emit('message', {
        handle: 'getNumber',
        authorization: wx.getStorageSync("token"),
        huodong_id: that.data.hdid
      });
      client.on('getNumber', (res) => {
        if (res.errno !== 0) {
          wx.showModal({
            title: '提示',
            content: res.errmsg,
            showCancel: false,
            confirmText: "去组队",
            confirmColor: "#3FB1BB",
            success(res) {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            }
          })
          return;
        }
        that.setData({
          owntotal: res.data.number,
          totlename: res.data.team_rank,
          obstacleId: res.data.obstacle ? res.data.obstacle : 0
        });
        if (res.data.obstacle) {
          that.duration();
        }
      })
      client.on('addNumber', (res) => {
        if (res.errno !== 0) {
          wx.showModal({
            title: '提示',
            content: res.errmsg,
            showCancel: false,
            confirmText: "领取奖励",
            confirmColor: "#3FB1BB",
            success(res) {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            }
          })
          return;
        }
        that.setData({
          owntotal: res.data.number,
          totlename: res.data.team_rank,
          obstacleId: res.data.obstacle ? res.data.obstacle : 0
        });
        if (res.data.obstacle) {
          // 显示3s后狂风显示
          that.duration();
        }
      })
      client.on('obstacle', (res) => {
        if (res.errno === 0) {
          // 设置他们的值
          that.setData({
            showView: !that.data.showView,
            clicktrue: true
          })
        }
      })
      // 奖励
      client.on('jiangli', (res) => {
        if (res.errno === 0) {
          // 奖励
          that.setData({
            showModal: true
          })
          that.setData({
            rank: res.data.rank,
            teamMoney: res.data.teamMoney,
            total: res.data.teamNumber,
            userMoney: res.data.userMoney,
            owntotal: res.data.userNumber,
          });
        }
      })
      client.on('rankList', (res)=>{
        if (res.errno === 0) {
          that.setData({
            total: res.teamNumber,
            owntotal: res.userNumber,
            rankList: res.list,
            totlename: res.teamRank
          });
        }
      })
    });
  },
  getRankList: function(){
    var that = this;
    client.emit("message", {
      handle: "rankList",
      authorization: wx.getStorageSync("token"),
      huodong_id: that.data.huodong.id,
      offset: 0,
      count: 3
    });
  },
  // 背景滚动
  util: function(obj) {
    var continueTime = (parseInt(obj.list / obj.container)) * 12000;
    var setIntervalTime = 6000;
    var animation = wx.createAnimation({
      duration: 50, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });
    this.animation = animation;
    animation.translateY(-obj.container).step({
      duration: 50,
      timingFunction: 'step-start'
    }).translateY(obj.list).step({
      duration: continueTime
    });
    this.setData({
      animationData: animation.export()
    })
    // 循环
    setInterval(() => {
      animation.translateY(-obj.container).step({
        duration: 50,
        timingFunction: 'step-start'
      }).translateY(obj.list).step({
        duration: continueTime
      });
      this.setData({
        animationData: animation.export()
      })
    }, setIntervalTime)
  },
  getHeight() {
    var obj = new Object();
    //创建节点选择器
    var query = wx.createSelectorQuery();
    query.select('.container').boundingClientRect()
    query.select('.content').boundingClientRect()
    query.exec((res) => {
      obj.container = res[0].height; // 框的height
      obj.list = res[1].height; // list的height
      // return obj;
      this.util(obj);
    })
  },
  getHuodong(callback) {
    wx.request({
      url: 'https://activity.aworld.cn/huodong',
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token')
      }, // 设置请求的 header
      success: function(res) {
        callback(res.data);
      }
    })
  },
  onShow: function() {
    var that = this;
    //围观数
    wx.request({
      url: URL.RANDSUM,
      method: 'get',
      header: {
        'Authorization': wx.getStorageSync("token")
      }, // 设置请求的 header
      success: (res) => {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            randSum: res.data
          });
        }
      }
    });
    //粽子数
    wx.request({
      url: URL.SPEEDNUMBER + "?status=1",
      method: 'get',
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token')
      },
      success: (res) => {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            acceleratorCount: res.count
          });
        }
      }
    });
    app.startTimer("rankTimer");
    app.globalData.rankTimer.callback = ()=>{
      that.getRankList();
    }
  },
  // 风暴
  storm() {
    var that = this;
    that.setData({
      showView: false,
      isDuobi: true
    });
    if (that.data.showView) {
      client.emit('message', {
        handle: "obstacle",
        authorization: wx.getStorageSync("token"),
        huodong_id: that.data.huodong.id,
        id: that.data.obstacleId
      });
    }
  },
  // 狂风显示
  duration() {
    var that = this;
    //如果点击了躲避/或者已经显示狂风，那么就直接返回
    if (that.data.isDuobi || that.data.showView) {
      return;
    }
    that.setData({
      showView: true
    });
    setTimeout(function() {
      if (!that.data.isDuobi) {
        that.setData({
          owntotal: that.data.owntotal - 10,
          total: that.data.total - 10
        });
      }
      that.setData({
        showView: false
      });
    }, 3000)
  },
  onUnload() {
    app.clearTimer();
    app.clearTimer("rankTimer");
    app.clearTimer("gameTimer");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  add: function() {
    // 设置船的动的值
    this.setData({
      botstyle: this.data.botstyle + 1,
      owntotal: this.data.owntotal + 1,
      total: this.data.total + 1
    })
    if (this.data.botstyle > 160) {
      this.data.botstyle = 160;
    }
    // 最后的值
    this.data.ship = this.data.botstyle
    client.emit('message', {
      handle: 'addNumber',
      authorization: wx.getStorageSync("token"),
      huodong_id: this.data.hdid
    });
  },
  // 粽子加速器
  accelerator: function() {
    var that = this;
    if (that.data.acceleratorCount <= 0) {
      return false;
    }
    that.setData({
      isJiasu: true,
      delayTime: 10
    });
    wx.request({
      url: 'https://activity.aworld.cn/speed/use',
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync("token")
      },
      success: function(res) {
        res = res.data;
        if (res.errno !== 0) {
          wx.showToast({
            title: res.errmsg,
            icon: "none",
            duration: 2000
          })
          return;
        }
        var ct = that.data.acceleratorCount - 1
        that.setData({
          acceleratorCount: ct
        });
        app.startTimer();
        app.globalData.timer.callback = ()=>{
          var delayTime = that.data.delayTime - 1;
          that.setData({
            delayTime: delayTime
          });
          if (delayTime <= 0) {
            app.clearTimer();
            that.setData({
              isJiasu: false,
            });
          }
        }
      }
    });
  },
  // 备战下一场
  goToInvitePage() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})