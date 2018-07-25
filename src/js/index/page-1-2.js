{
  let view = {
    el: 'section.latest',
    template: `
    <li>
      <h3>{{song.name}}</h3>
      <p>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-highquality"></use>
        </svg>
        {{song.singer}}
      </p>
      <a href="./song.html?id={{song.id}}" class="run">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-bofang"></use>
        </svg>
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
          .replace('{{song.id}}', song.id))
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