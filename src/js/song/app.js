{
  let view = {
    el: '#app',
    template: `
      <style>
      .diskWrapper::after{background: url({{img}}) no-repeat center center;content: '';background-size: cover;filter: blur(30px);position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index: -1;}
      </style>
      <audio src="{{url}}"></audio>
      <div class="diskWrapper">
        <img class="citouImg" src="./img/citou.png" alt="">
        <div class="disk">
          <img class="diskImg" src="./img/disk-light.png">
          <img class="diskLight" src="./img/disk.png">
          <img class="backgroundImg" src="{{img}}">
        </div>
        <div class="icon">
          <svg class="icon-playing" aria-hidden="true">
            <use xlink:href="#icon-zanting3"></use>
          </svg>
          <svg class="icon-pause" aria-hidden="true">
            <use xlink:href="#icon-zanting2"></use>
          </svg>
        </div>
        <div class="content">
          <h2>{{name}}</h2>
          <div class="lyrics-wrapper">
            <div class="lyrics"></div>
          </div>
        </div>
      </div>
      
    `,
    init() {
      this.$el = $(this.el)
    },
    render(data) {
      let _this = this
      let {
        lyrics,
        songs
      } = data

      this.$el.html(this.template.replace('{{url}}', songs.url)
        .replace(/{{img}}/g, songs.img)
        .replace('{{name}}', songs.name))

      let div = this.$el.find('.lyrics')


      lyrics.map((value) => {
        let p = $(`<p data-time=${value[0]}>${value[1]}</p>`)
        div.append(p)
      })

      //audio的很多事件不支持冒泡
      this.$el.find('audio').on('ended', () => {
        this.pause()
      })
      this.$el.find('audio').on('timeupdate', function () {
        //根据currentTime找到相应的p标签

        let currentP = lyrics[0][0]
        for (let i = 0; i < lyrics.length; i++) {
          if (this.currentTime < lyrics[i][0]) {
            activeP(currentP)
            break;
          }
          currentP = lyrics[i][0]
        }

      })

      function activeP(time) {
        let allP = _this.$el.find('.lyrics>p')
        let lyrics = _this.$el.find('.lyrics')
        for (let i = 0; i < allP.length; i++) {
          if(allP.eq(i).attr('data-time') == time){
            allP.eq(i).addClass('active').siblings('.active').removeClass('active')
            if(i>5 && i < allP.length-5){
              lyrics.css({'transform':`translateY(-${(i-5)*30}px)`})
            }


          }
        }

      }

    },
    play() {
      this.$el.find('.diskWrapper>.disk').addClass('playing')
      this.$el.find('.icon').addClass('paused')
      this.$el.find('audio')[0].play()
    },
    pause() {
      this.$el.find('.diskWrapper>.disk').removeClass('playing')
      this.$el.find('.icon').removeClass('paused')
      this.$el.find('audio')[0].pause()
    },
  }

  let model = {
    data: {
      id: '',
      lyrics: [],
      songs: {}
    },
    setId(id) {
      this.data.id = id
    },
    getSongs(id) {
      let query = new AV.Query('Song')
      return query.get(id).then((song) => {
        this.data.songs = {
          id: song.id,
          ...song.attributes
        }
      })
    },
    execLyrics(data) {
      let {
        lyrics
      } = data.songs
      let lyricsArr = lyrics.split('\n')
      let reg = /\[(\d{2}:\d{2}\.\d{2})\](.+)/
      this.data.lyrics = lyricsArr.map((song) => {
        let rowInfo = reg.exec(song)
        //时间轴
        let time = rowInfo[1]
        //转换时间单位
        let tempReg = /(.+):(.+)\.(.+)/
        let tempArr = tempReg.exec(time)
        time = parseInt(tempArr[1]) * 60 + parseInt(tempArr[2]) + parseFloat(tempArr[3]) / 100

        //歌词
        let string = rowInfo[2]
        return [time, string]
      })
    }
  }

  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      let id = this.getId()
      this.model.setId(id)
      this.model.getSongs(this.model.data.id).then(() => {
        this.model.execLyrics(this.model.data)
        this.view.render(this.model.data)
      })
      this.bindEvents()
    },
    getId() {
      let searchString = window.location.search
      if (searchString.indexOf('?') !== -1) {
        searchString = searchString.slice(1)
      }
      let searchArr = searchString.split('&')
      for (let i = 0; i < searchArr.length; i++) {
        let tempArr = searchArr[i].split('=')
        if (tempArr[0] === 'id')
          return tempArr[1]
      }
    },
    bindEvents() {
      this.view.$el.on('click', '.icon-playing', () => {
        this.view.play()
      })
      this.view.$el.on('click', '.icon-pause', () => {
        this.view.pause()
      })


    }
  }

  controller.init(view, model)
}