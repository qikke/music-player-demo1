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
      songs: []
    },
    find() {
      let query = new AV.Query('Song')
      return query.find().then((songs) => {
        this.data.songs = songs.map((song) => {
          return {
            id: song.id,
            ...song.attributes
          }
        })
        console.log(this.data.songs)
        return songs
      })
    }
  }
  let controller = {
    init: function (view, model) {
      this.view = view
      this.model = model
      this.view.init()
      this.findAndRender()
      window.eventHub.on('upload', () => {
        this.removeAllActive()
      })
      window.eventHub.on('uploaded', (data) => {
        // let id = this.model.data.songs.length + 1
        // let name = data.name
        // this.model.data.songs.push({
        //   id,
        //   name
        // })
        // this.view.render(this.model.data)
        this.findAndRender()
      })
    },
    removeAllActive() {
      $(this.view.el).find('.active').removeClass('active')
    },
    findAndRender() {
      this.model.find().then(() => {
        this.view.render(this.model.data)
      })
    }
  }

  controller.init(view, model)
}