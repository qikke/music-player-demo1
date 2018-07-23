{
  let view = {
    el: '.page .newSong',
    template: `新建歌曲`,
    render: function (data) {
      $(this.el).html(data)
    },
    init() {
      this.$el = $(this.el)
    },
    active() {
      this.$el.addClass('active')
    },
    deActive() {
      this.$el.removeClass('active')
    }
  }
  let model = {}
  let controller = {
    init: function (view, model) {
      this.view = view
      this.model = model
      this.view.init()
      this.view.active()
      this.view.render(this.view.template)
      this.bindEventHub()
      this.bindEvents()
    },
    bindEventHub() {
      window.eventHub.on('upload', () => {
        this.view.active()
      })
      window.eventHub.on('select', () => {
        this.view.deActive()
      })
    },
    bindEvents() {
      this.view.$el.on('click', (e) => {
        this.view.active()
        window.eventHub.emit('selectNewSong')
      })
    },
  }

  controller.init(view, model)
}