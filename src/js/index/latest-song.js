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
      let _this = this
      let songs = data.songs
      let $ol = this.$el.find('ol')
      for(let i = 0; i < 5; i++){
        let audio = $(`<audio src="${songs[i].url}"></audio>`)
        audio.on('canplay',function(){
          _this.$el.find('.songTime')[i].innerHTML = _this.secondsToMinutes(this.duration)
        })

        let $li = $(this.template.replace('{{song.name}}', songs[i].name)
          .replace('{{song.singer}}', songs[i].singer)
          .replace('{{song.id}}', songs[i].id)
          .replace('{{song.img}}', songs[i].img))
        $ol.append($li)
      }
    },
    secondsToMinutes(second){
      let intSeconds = (second >> 0)
      let minutes = (intSeconds / 60) >> 0
      let seconds = intSeconds % 60
      seconds = seconds < 10 ? '0' + seconds : seconds
      return minutes + ':' + seconds
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