{
  let view = {
    el: '#app',
    template: `
      <style>
        .songImg-wrapper{background: url({{img}})}
      </style>
      <audio src="{{url}}"></audio>
     <div class="song-content">
        <svg class="icon returnButton" aria-hidden="true">
          <use xlink:href="#icon-fanhui"></use>
        </svg>
        <span class="songName">{{name}}</span>
        <span class="singer">{{singer}}</span>
        <div class="songImg-wrapper"></div>
        <img class="songImg"
             src="{{img}}"
             alt="">
         <div class="lyrics-wrap">
          <div class="lyrics"></div>
         </div>
       
        <div class="audio-controller">
          <div class="control-bar-wrap">
            <div class="control-bar-loaded"></div>
            <div class="control-bar-played"></div>
            <div class="control-bar-ball"></div>
          </div>
          <span class="currentTime">0:00</span>
          <span class="totalTime">3:10</span>
        </div>
        <div class="audio-switch">
          <a href="./song.html?id={{pre-id}}">
            <svg class="previous" aria-hidden="true">
              <use xlink:href="#icon-xiayishou1"></use>
            </svg>
          </a>
          <svg class="start active" aria-hidden="true">
            <use xlink:href="#icon-bofang1"></use>
          </svg> 
          <svg class="stop" aria-hidden="true">
            <use xlink:href="#icon-stop"></use>
          </svg>
          <a href="./song.html?id={{next-id}}">
            <svg class="next" aria-hidden="true">
              <use xlink:href="#icon-xiayishou"></use>
            </svg>
          </a>
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
        .replace('{{name}}', songs.name)
        .replace('{{singer}}', songs.singer)
        .replace('{{pre-id}}',songs.prev_id)
        .replace('{{next-id}}',songs.next_id))

      //render lyrics
      let div = this.$el.find('.lyrics')
      lyrics.map((value) => {
        let p = $(`<p data-time=${value[0]}>${value[1]}</p>`)
        div.append(p)
      })

      this.$el.find('audio').on('timeupdate', function (e) {
        //根据currentTime找到相应的p标签
        let currentP = lyrics[0][0]
        for (let i = 0; i < lyrics.length; i++) {
          if (this.currentTime < lyrics[i][0]) {
            activeP(currentP)
            break
          }
          currentP = lyrics[i][0]
        }

        //update current time
        let seconds = (this.currentTime >> 0) % 60 //rounding
        seconds = seconds >= 10 ? seconds : '0' + seconds
        let minutes = (this.currentTime / 60) >> 0
        let currentTime = minutes + ':' + seconds
        _this.$el.find('.currentTime').html(currentTime)

        //update progress bar
        let barWidth = (this.currentTime / this.duration * 100).toFixed(2)

        _this.$el.find('.control-bar-played').css({
          width: barWidth + '%'
        })
      })

      function activeP(time) {
        let allP = _this.$el.find('.lyrics>p')
        let lyrics = _this.$el.find('.lyrics')
        for (let i = 0; i < allP.length; i++) {
          if (allP.eq(i).attr('data-time') == time) {
            allP.eq(i).addClass('active').siblings('.active').removeClass('active')
            if (i > 1 && i < allP.length - 1) {
              lyrics.css({'transform': `translateY(-${(i - 1) * 6}vw)`})
            }
          }
        }
      }
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
      return query.find().then((songs) => {
        for (let i = 0; i < songs.length; i++) {
          let prevIndex = (i - 1) < 0 ? songs.length - 1 : i - 1
          let nextIndex = (i + 1) >= songs.length ? 0 : i + 1
          if (songs[i].id === id) {
            this.data.songs = {
              prev_id: songs[prevIndex].id,
              next_id: songs[nextIndex].id,
              id: songs[i].id,
              ...songs[i].attributes
            }
          }
        }
      })
    },

    execLyrics(data) {
      let {
        lyrics
      } = data.songs
      let lyricsArr = lyrics.split('\n')
      let reg = /\[(\d{2}:\d{2}\.\d{2}).?\](.+)/

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
      this.model = model
      this.view.init()

      let id = this.getId()
      this.model.setId(id)

      this.model.getSongs(this.model.data.id).then(() => {
        this.model.execLyrics(this.model.data)
        this.view.render(this.model.data)
        this.bindEvents()
      })
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
      let _this = this
      this.view.$el.on('click', '.start', () => {
        this.play()
      })

      this.view.$el.on('click', '.stop', () => {
        this.pause()
      })

      //audio的很多事件不支持冒泡
      this.view.$el.find('audio').on('ended', () => {
        this.pause()
      })

      //update duration
      this.view.$el.find('audio').on('loadedmetadata', function () {
        let minutes = this.duration / 60 >> 0
        let seconds = this.duration >> 0 % 60 >= 10 ? (this.duration >> 0) % 60 : '0' + (this.duration >> 0) % 60
        let duration = minutes + ':' + seconds
        _this.view.$el.find('.totalTime').html(duration)
      })


      this.view.$el.find('audio')[0].onloadedmetadata = () => {
        this.view.$el.on('click', '.control-bar-loaded', function (e) {
          let audio = _this.view.$el.find('audio')[0]
          //change progress bar's position
          let position = (e.offsetX / $(this).width()).toFixed(2)
          _this.view.$el.find('.control-bar-played').css({
            width: position * 100 + '%'
          })
          audio.currentTime = position * audio.duration
        })
      }

      //return to index
      _this.view.$el.on('click', '.returnButton', () => {
        window.history.back()
      })
    },

    pause() {
      this.view.$el.find('.stop').removeClass('active')
      this.view.$el.find('.start').addClass('active')
      this.view.$el.find('audio')[0].pause()
    },

    play() {
      this.view.$el.find('audio')[0].play()
      this.view.$el.find('.start').removeClass('active')
      this.view.$el.find('.stop').addClass('active')
    },
  }

  controller.init(view, model)
}