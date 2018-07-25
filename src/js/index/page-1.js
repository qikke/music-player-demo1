{
  let view = {
    el: '.page-1',
    init() {
      this.$el = $(this.el)
    }
  }

  let controller = {
    init(view) {
      this.view = view
      this.view.init()
      this.bindEventHub()
    },
    bindEventHub() {
      window.eventHub.on('tabClick', (data) => {
        let {
          index
        } = data
        if(this.view.$el.index() === index){
          this.view.$el.show()
        }else{
          this.view.$el.hide()
        }
      })
    }
  }
  controller.init(view)
}