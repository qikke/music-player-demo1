{
  let view = {
    el: 'section.latestSong',
    template: `
    <li class="latestSong-content-list">
      <a href="./song.html?id={{song.id}}">
       <img
            src="{{song.img}}"
        >
        <div class="song-intro">
          <span class="songName">{{song.name}}</span>
          <span class="artistName">{{song.singer}}</span>
        </div>
        <span class="songTime">3:20</span>
       </a>
      </li>
    `,
    init() {
      this.$el = $(this.el)
    },
    render(data) {
      let songs = data.songs
      let $ol = this.$el.find('ol')
      songs.map((song) => {
        let $li = $(this.template.replace('{{song.name}}', song.name)
          .replace('{{song.singer}}', song.singer)
          .replace('{{song.id}}', song.id)
          .replace('{{song.img}}', song.img))
        $ol.append($li)
      })
    }
  }

  let model = {
    data: {
      songs: []
    },
    find() {
      let query = new AV.Query('Song')
      return query.find().then((songs) => {
        console.log(1)
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
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      this.model.find().then(() => {
        this.view.render(this.model.data)
      })
    }
  }

  controller.init(view, model)

}