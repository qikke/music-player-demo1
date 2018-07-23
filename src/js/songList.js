{
  let view = {
    el: '.page .songList',
    template: `<ul></ul>`,
    render: function (data) {
      if (data) {
        this.$el.html(this.template)
        let {
          songs
        } = data
        songs.map((song) => {
          let li = $(`<li>${song.name}</li>`)
          this.$el.find('ul').append(li)
        })
      }
    },
    init() {
      this.$el = $(this.el)
    }
  }
  let model = {
    data: {
      songs: [{
        id: 1,
        name: '1'
      }, {
        id: 2,
        name: '2'
      }]
    }
  }
  let controller = {
    init: function (view, model) {
      this.view = view
      this.model = model
      this.view.init()
      this.view.render(this.model.data)
      window.eventHub.on('upload', () => {
        this.removeAllActive()
      })
      window.eventHub.on('uploaded', (data) => {
        let id = this.model.data.songs.length + 1
        let name = data.name
        this.model.data.songs.push({id,name})
        this.view.render(this.model.data)
      })
    },
    removeAllActive() {
      $(this.view.el).find('.active').removeClass('active')
    }
  }

  controller.init(view, model)
}