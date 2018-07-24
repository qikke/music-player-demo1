{
  let view = {
    el: '#loader',
    init() {
      this.$el = $(this.el)
    },
    addActive() {
      this.$el.addClass('active')
    },
    removeActive() {
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
      window.eventHub.on('beforeUpload', () => {
        this.view.addActive()
      })
      window.eventHub.on('uploaded', () => {
        this.view.removeActive()
      })
    }
  }

  controller.init(view)

}