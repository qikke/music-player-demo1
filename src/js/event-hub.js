window.eventHub = {
  events: {
    //上传文件时触发
    upload: [],
    //上传成功后触发
    uploaded:[],
  },
  //订阅
  on: function (eventName, fn) {
    if (this.events[eventName]) {
      this.events[eventName].push(fn)
    } else {
      console.log("this event is not exit")
    }
  },
  //发布
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => {
        fn.call(undefined, data)
      })
    } else {
      console.log("this event is not exit")
    }
  }
}