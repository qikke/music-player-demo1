{
  let view = {
    el: '.page .newSong',
    template: `新建歌曲`,
    render: function (data) {
      $(this.el).html(data)
    }
  }
  let model = {}
  let controller = {
    init: function (view, model) {
      this.view = view
      this.model = model
      this.active()
      this.view.render(this.view.template)
      window.eventHub.on('upload', () => {
        this.active()
      })
    },
    active(){
      $(this.view.el).addClass('active')
    }
  }

  controller.init(view, model)
}