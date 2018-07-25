{
  let view = {
    el: '.page-2',
    init() {
      this.$el = $(this.el)
      this.$el.hide()
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