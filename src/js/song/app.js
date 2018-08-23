{
  let view = {
    el: '#app',
    template: `
      <style>
        .songImg-wrapper{background: url({{img}})}
      </style>
      <audio src="{{url}}"></audio>
     <div class="song-content">
        <svg class="icon" aria-hidden="true">
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
          <svg class="previous" aria-hidden="true">
            <use xlink:href="#icon-xiayishou1"></use>
          </svg>
          <svg class="start active" aria-hidden="true">
            <use xlink:href="#icon-bofang1"></use>
          </svg> 
          <svg class="stop" aria-hidden="true">
            <use xlink:href="#icon-stop"></use>
          </svg>
          <svg class="next" aria-hidden="true">
            <use xlink:href="#icon-xiayishou"></use>
          </svg>
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
        .replace('{{singer}}',songs.singer))


      let div = this.$el.find('.lyrics')

      lyrics.map((value) => {
        let p = $(`<p data-time=${value[0]}>${value[1]}</p>`)
        div.append(p)
      })

      //update duration
      this.$el.find('audio').on('loadedmetadata',function(){
        let minutes = this.duration/60 >> 0
        let seconds = this.duration >> 0 % 60 >= 10 ? (this.duration >> 0) % 60 : '0' + (this.duration>> 0) % 60
        let duration = minutes + ':' + seconds
        _this.$el.find('.totalTime').html(duration)
      })

      //audio的很多事件不支持冒泡
      this.$el.find('audio').on('ended', () => {
        this.pause()
      })
      this.$el.find('audio').on('timeupdate', function (e) {
        //根据currentTime找到相应的p标签
        let currentP = lyrics[0][0]
        for (let i = 0; i < lyrics.length; i++) {
          if (this.currentTime < lyrics[i][0]) {
            activeP(currentP)
            break;
          }
          currentP = lyrics[i][0]
        }

        //update current time
        //rounding
        let seconds = (e.timeStamp/1000 >> 0) % 60
        seconds = seconds >= 10 ? seconds : '0' + seconds
        let minutes = (e.timeStamp/1000 / 60) >> 0
        let currentTime = minutes + ':' + seconds
        _this.$el.find('.currentTime').html(currentTime)

        //update progress bar
        let barWidth = (this.currentTime/this.duration* 100).toFixed(2)

        _this.$el.find('.control-bar-played').css({
          width: barWidth + '%'
        })
      })

      function activeP(time) {
        let allP = _this.$el.find('.lyrics>p')
        let lyrics = _this.$el.find('.lyrics')
        for (let i = 0; i < allP.length; i++) {
          if(allP.eq(i).attr('data-time') == time){
            allP.eq(i).addClass('active').siblings('.active').removeClass('active')
            if(i>1 && i < allP.length-1){
              lyrics.css({'transform':`translateY(-${(i-1)*6}vw)`})
            }
          }
        }
      }
    },
    play() {
      this.$el.find('audio')[0].play()
      this.$el.find('.start').removeClass('active')
      this.$el.find('.stop').addClass('active')
    },
    pause() {
      // this.$el.find('.diskWrapper>.disk').removeClass('playing')
      this.$el.find('.stop').removeClass('active')
      this.$el.find('.start').addClass('active')
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
      this.view.$el.on('click', '.start', () => {
        this.view.play()
      })
      this.view.$el.on('click', '.stop', () => {
        this.view.pause()
      })
    }
  }

  controller.init(view, model)
}