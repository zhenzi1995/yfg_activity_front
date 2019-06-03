// pages/active/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //获取粽子数
    wx.request({
      url: 'https://activity.aworld.cn/speed?status=1',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token')
      }, // 设置请求的 header
      success: function (res) {
        res = res.data;
        if (res.errno === 0) {
          that.setData({
            count: res.count
          })
        }
      }
    })
  },

  invite: function(){
    wx.navigateTo({
      url: '/pages/invite/index',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})