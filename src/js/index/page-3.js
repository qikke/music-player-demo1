{
  let view = {
    el: '.page-3',
    init() {
      this.$el = $(this.el)
    },
    show(){
      this.$el.addClass('active')
    },
    hide(){
      this.$el.removeClass('active')
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
          this.view.show()
        }else{
          this.view.hide()
        }
      })
    }
  }
  controller.init(view)
}