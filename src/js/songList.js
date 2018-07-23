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
          let li = $(`<li data-song-id=${song.id}>${song.name}</li>`)
          this.$el.find('ul').append(li)
        })
      }
    },
    init() {
      this.$el = $(this.el)
    },
    activeItem(li) {
      $(li).addClass('active').siblings('.active').removeClass('active')
    },
    removeActive() {
      this.$el.find('.active').removeClass('active')
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
      this.bindEventHub()
      this.bindEvents()
    },
    removeAllActive() {
      $(this.view.el).find('.active').removeClass('active')
    },
    findAndRender() {
      this.model.find().then(() => {
        this.view.render(this.model.data)
      })
    },
    bindEventHub() {
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
      window.eventHub.on('selectNewSong', () => {
        this.view.removeActive()
      })
    },
    bindEvents() {
      this.view.$el.on('click', 'li', (e) => {
        let li = e.currentTarget
        this.view.activeItem(li)
        let songId = li.getAttribute('data-song-id')
        let {
          songs
        } = this.model.data
        let data = {}
        for (let i = 0; i < songs.length; i++) {
          if (songs[i].id === songId) {
            data = songs[i]
            break
          }
        }
        window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))
      })
    }
  }

  controller.init(view, model)
}