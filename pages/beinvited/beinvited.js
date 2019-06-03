var app = getApp(); // pages/beinvited.js
const moment = require('../../moment.min.js');
import {
  URL
} from '../../utils/urlModel';
Page({
  data: {
    showLogin: true, // 登录弹框
    token: "",
    topImg: [
      'https://img.aworld.cn/zteam1.jpg',
      'https://img.aworld.cn/zteam2.jpg',
      'https://img.aworld.cn/zteam3.jpg',
      'https://img.aworld.cn/zteam4.jpg',
      'https://img.aworld.cn/zteam5.jpg',
      'https://img.aworld.cn/zteam6.jpg'
    ],
    headimg: '',
    countDownHour: 0,
    countDownMinute: 0,
    countDownSecond: 0,
    countDownDay: 0,
    dateTime: {
      date: "",
      time: "",
    },
    huodong_id: 0,
    huodong: {},
    teamId: 0,
    teamData: {},
    loginActive: 1,
    invite_id: 0, //邀请者
    interval: '',
    title: '',
  },
  createPoster: function() {
    wx.navigateTo({
      url: '/pages/poster/index'
    })
  },
  goHome: function() {
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  getHuodong(callback) {
    wx.request({
      url: 'https://activity.aworld.cn/huodong?endInvalid=1&id=' + this.data.huodong_id,
      success: function(res) {
        callback(res.data);
      }
    })
  },
  getTeamData(callback) {
    wx.request({
      url: URL.TEAM + "?id=" + this.data.teamId + "&huodong_id=" + this.data.huodong_id,
      header: {
        'content-type': 'application/json',
        'Authorization': this.data.token
      },
      success: function(res) {
        res = res.data;
        if (res.errno !== 0) {
        }
        callback(res);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      title: app.globalData.title
    });
    let token = wx.getStorageSync("token")
    this.setData({
      token: token
    });
    if (this.data.token) {
      this.setData({
        showLogin: false
      });
    }
    //最后就直接可以在分享中调用
    let randomImg = wx.getStorageSync("randomImg");
    if (!randomImg) {
      randomImg = this.data.topImg[Math.floor(Math.random() * this.data.topImg.length)];
      wx.setStorageSync("randomImg", randomImg)
    }
    this.setData({
      headimg: randomImg
    });
    var that = this;
    that.setData({
      invite_id: options.invite_id ? parseInt(options.invite_id) : 0,
      huodong_id: options.huodong_id ? parseInt(options.huodong_id) : 0,
      teamData: {
        id: options.teamid ? parseInt(options.teamid) : 0
      }
    });
    //获取活动信息
    this.getHuodong(function(res) {
      if(res.errno !== 0){
        wx.showModal({
          title: '提示',
          content: '本场活动已结束',
          showCancel: false,
          confirmText: "返回首页",
          success(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            }
          }
        })
        return;
      }
      that.setData({
        huodong: res.data
      });
      app.startTimer();
      app.globalData.timer.callback = function () {
        var nowTime = moment().format("X");
        var eTime = moment(res.data.end_time).format("X");
        // 时间格式2019-2-1 14：00：00
        var nowTime = moment(); // 当前时间
        var sTime = moment(res.data.start_time); // 活动开始时间
        var du = moment(nowTime - sTime);
        var qq = moment.duration(sTime.diff(nowTime));
        var countDown = {
          countDownDay: parseInt(qq.asDays()),
          countDownHour: parseInt(qq.asHours(), 10), //时
          countDownMinute: parseInt(qq.asMinutes()) % 60, // 分
          countDownSecond: parseInt(qq.asSeconds()) % 60 // 秒
        };
        if (countDown.countDownDay <= 0 && countDown.countDownHour <= 0 && countDown.countDownMinute <= 0 && countDown.countDownSecond <= 0 && that.data.huodong.id !== 0) {
          var countDown = {
            countDownDay: 0,
            countDownHour: 0, //时
            countDownMinute: 0, // 分
            countDownSecond: 0, // 秒
          }
          app.clearTimer();
          if (that.data.token) {
            wx.navigateTo({
              url: '/pages/game/index',
            })
          }
        }
        that.setData(countDown);
      };
      //获取团队数据
      that.setData({
        teamId: options.teamid ? parseInt(options.teamid) : 0
      });
      that.getTeamDataAndJoin();
    });
  },
  onUnload: function() {
    app.clearTimer();
  },
  getTeamDataAndJoin: function() {
    var that = this;
    //获取队伍信息
    that.getTeamData(function(res) {
      console.log(res);
      if (res.errno === 0) {
        that.setData({
          teamData: res.data
        });
        //加入该队伍
        wx.request({
          url: 'https://activity.aworld.cn/team/join',
          method: 'post',
          data: {
            huodong_id: that.data.huodong.id,
            team_id: that.data.teamData.id,
            invite_id: that.data.invite_id
          },
          header: {
            'content-type': 'application/json',
            'Authorization': that.data.token
          },
          success: function(res) {
            res = res.data;
            if (res.errno !== 0) {
              // wx.showModal({
              //   title: '提示',
              //   content: res.errmsg,
              //   confirmText: "确认",
              //   // success(res) { 
              //   //   if (res.confirm) {
              //   //     wx.navigateTo({
              //   //       url: '/pages/index/index',
              //   //     })
              //   //   }
              //   // }
              // })
              return;
            }
            //加入成功以后重新获取队伍信息
            that.getTeamData(function(res) {
              console.log(res.data)
              if (res.errno === 0) {
                that.setData({
                  teamData: res.data
                });
              }
            });
          }
        });
      }
    });
  },
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
          that.getTeamDataAndJoin();
        }
      })
    }
  },
  goHome: function() {
    wx.reLaunch({
      url: "/pages/index/index"
    })
  }
})