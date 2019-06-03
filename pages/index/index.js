var app = getApp()
const moment = require('../../moment.min.js');
import {
  URL
} from '../../utils/urlModel';
Page({
  data: {
    currentTab: 0,
    // showModal: true, // 弹框显示隐藏
    token: wx.getStorageSync("token"),
    showLogin: true, // 登录弹框
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    countDownTime: "00:00",
    countDownDay: 0,
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    countDownDay: 0,
    detail: '',
    list: [],
    allList: [],
    huodongData: {},
    lasthuodong: {},
    loginActive: 1,
    randSum: {},
    huodongNext: {},
    jiangjin: {},
    teamData: {},
    huodongId: 0,
  },
  activeclick: function() {
    wx.navigateTo({
      url: '/pages/active/index'
    })
  },
  receiveclick: function() {
    this.setData({
      showModal: true
    })
    this.jiangjin();

  },
  hideModal: function() {
    this.setData({
      showModal: false
    })
  },
  //tab栏开始
  clickTab: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },
  // tab栏结束
  onLoad: function() {
    var that = this;
    that.jiangjin()
    that.setData({
      token: wx.getStorageSync("token")
    });
    if (that.data.token) {
      that.setData({
        showLogin: false
      });
    } else {
      if (app.globalData.userInfo) {
        that.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      } else if (that.data.canIUse) {
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        app.userInfoReadyCallback = res => {
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      } else {
        // 在没有 open-type=getUserInfo 版本的兼容处理
        wx.getUserInfo({
          success: res => {
            app.globalData.userInfo = res.userInfo
            that.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
          }
        })
      }
    }
    //围观数
    wx.request({
      url: "https://activity.aworld.cn/user/randSum",
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token')
      },
      success(res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            randSum: res.data
          });
        }
      }
    });
    that.history();
    that.getAllList();
  },
  onShow() {
    this.active();
  },

  // 活动历史
  history: function() {
    var that = this;
    wx.request({
      url: 'https://activity.aworld.cn/huodong/last',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'Authorization': that.data.token
      }, // 设置请求的 header
      success: function(res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            lasthuodong: res.data
          })
          that.teamlist(that.data.lasthuodong.id);
        }
      },
    })
  },
  // 奖金
  jiangjin: function() {
    var that = this;
    wx.request({
      url: 'https://activity.aworld.cn/team/sumMoney',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'Authorization': that.data.token
      }, // 设置请求的 header
      success: function(res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            jiangjin: res.data
          })
          //that.teamlist(that.data.lasthuodong.id);
        }
      },
    })
  },
  // 队伍列表
  teamlist: function(huodongId) {
    huodongId = huodongId || 0;
    this.setData({
      huodongId: huodongId,
    })
    var that = this;
    wx.request({
      url: 'https://activity.aworld.cn/team/list?huodong_id=' + huodongId,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'Authorization': that.data.token
      }, // 设置请求的 header
      success: function(res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            list: res.list,
          })
        }
      },
    })
  },
  getAllList: function() {
    var that = this;
    wx.request({
      url: 'https://activity.aworld.cn/team/beforeData',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'Authorization': that.data.token
      }, // 设置请求的 header
      success: function(res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            allList: res.list
          })
        }
      }
    })
  },
  // 获取时间
  active: function() {
    var that = this;
    app.startTimer();
    let header = {
      'content-type': 'application/json',
      'Authorization': that.data.token
    };
    wx.request({
      url: 'https://activity.aworld.cn/huodong',
      method: 'get',
      header: header,
      success: function(res) {
        res = res.data;
        if (res.errno !== 0) {
          wx.showToast({
            title: res.errmsg,
            icon: 'none',
            duration: 2000
          })
          return;
        }
        that.setData({
          huodongData: res.data,
          huodongNext: res.next || {}
        });
        //根据活动请求我的队伍
        wx.request({
          url: URL.TEAM + "?huodong_id=" + that.data.huodongData.id,
          method: 'GET',
          header: header,
          success: res => {
            res = res.data;
            if (res.errno === 0) {
              that.setData({
                teamData: res.data,
              });
            }
            var endCallback = ()=>{
              if (that.data.teamData.id) {
                wx.navigateTo({
                  url: '/pages/game/index',
                })
              } else {
                app.startTimer();
                app.globalData.timer.callback = function () {
                  that.setPageTime(that.data.huodongNext.start_time, () => {
                    endCallback();
                  })
                }
              }
            }
            app.globalData.timer.callback = function() {
              that.setPageTime(that.data.huodongData.start_time, ()=>{
                endCallback();
              })
            }
          }
        })
      }
    })
  },
  setPageTime: function(datetime, endCallback) {
    var that = this;
    var totalSecond = new Date();
    // 时间格式2019-2-1 14：00：00
    var nowTime = moment(); // 当前时间
    var sTime = moment(datetime); // 活动开始时间
    var du = moment(sTime - nowTime);
    var qq = moment.duration(sTime.diff(nowTime));
    var countDown = {
      countDownTime: moment(datetime).format("HH:mm"),
      countDownDay: parseInt(qq.asDays()),
      countDownHour: parseInt(qq.asHours(), 10), //时
      countDownMinute: parseInt(qq.asMinutes()) % 60, // 分
      countDownSecond: parseInt(qq.asSeconds()) % 60, // 秒
    }
    if (countDown.countDownDay <= 0 && countDown.countDownHour <= 0 && countDown.countDownMinute <= 0 && countDown.countDownSecond <= 0 && that.data.huodongId !== 0) {
      var countDown = {
        countDownDay: 0,
        countDownHour: 0, //时
        countDownMinute: 0, // 分
        countDownSecond: 0, // 秒
      }
      app.clearTimer();
      if (endCallback)
        endCallback();
    }
    that.setData(countDown);
  },
  onUnload: function () {
    app.clearTimer();
  },
  // 获取用户信息
  getUserInfo: function(e) {
    var that = this;
    var postdata = e.detail;
    wx.login({
      success: res => {
        postdata.code = res.code;
        postdata.iv = encodeURIComponent(postdata.iv);
        postdata.encryptedData = encodeURIComponent(postdata.encryptedData);
        wx.request({
          url: URL.LOGIN,
          data: postdata,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            res = res.data;
            if (res.errno !== 0) {
              wx.showToast({
                title: '请重新点击授权',
                icon: 'success',
                duration: 2000
              });
              return false;
            }
            //存入缓存即可
            that.setData({
              token: res.data.token
            });
            wx.setStorageSync('token', res.data.token);
            that.setData({
              loginActive: 2
            });
          }
        });
      }
    });
  },
  // 授权微信
  getPhoneNumber: function(e) {
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权'
      })
    } else {
      var postdata = e.detail;
      postdata.iv = encodeURIComponent(postdata.iv);
      postdata.encryptedData = encodeURIComponent(postdata.encryptedData);
      wx.request({
        url: URL.PHONENUMBER,
        data: postdata,
        method: 'POST',
        header: {
          'Authorization': that.data.token,
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function(res) {
          res = res.data;
          if (res.errno !== 0) {
            wx.showToast({
              title: '请重新获取手机号码',
              icon: 'success',
              duration: 2000
            });
            return false;
          }
          that.setData({
            showLogin: false
          })
          // wx.reLaunch({
          //   url: '/pages/index/index',
          // })
        }
      })
    }
  },
  // 跳转到邀请页面
  goToInvitePage() {
    wx.navigateTo({
      url: '/pages/invite/index'
    })
  }
  // 上啦加载数据
})