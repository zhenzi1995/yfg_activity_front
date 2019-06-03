
import { URL } from './utils/urlModel.js';
const moment = require('moment.min.js');
App({

  onLaunch: function() {
    var that = this;
  },
  startTimer:function(name){
    name = name || "timer";
    let globalData = this.globalData;
    if (globalData[name].id){
      clearInterval(globalData[name].id);
      this.globalData[name].id = null;
    }
    globalData[name].id = setInterval(function () {
      if (globalData[name].callback)
        globalData[name].callback();
    }, 1000);
  },
  clearTimer: function (name){
    name = name || "timer";
    let globalData = this.globalData;
    if (globalData[name].id)
      clearInterval(globalData[name].id);
  },
  globalData: {
    timer:{
      id: null,
      callback: null
    },
    //排名的定时器
    rankTimer: {
      id: null,
      callback: null
    },
    //gameTimer
    gameTimer: {
      id: null,
      callback: null
    },
    userInfo: null,
    showLogin:null,
    title:null,
    datetime:null,
  }
})