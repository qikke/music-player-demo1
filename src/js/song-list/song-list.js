{
  let view = {
    el: '.songList',
    template: `
      <section class="topbar">
        <span class="topic">SONG LIST</span>
        <img src="{{img}}">
        <svg class="returnButton" aria-hidden="true">
          <use xlink:href="#icon-fanhui"></use>
        </svg>
      </section>
    
      <section class="info">
        <div class="songs">
          <span class="counts">163</span>
          <span class="name">Songs</span>
        </div>
        <div class="collection">
          <span class="counts">54</span>
          <span class="name">Collection</span>
        </div>
        <div class="likes">
          <span class="counts">1,365</span>
          <span class="name">Likes</span>
        </div>
      </section>
    
      <main>
        <div class="header">Songs,5 ITEMs</div>
        <ol></ol>
      </main>
    `,
    init() {
      this.$el = $(this.el)
    },
    render(data) {

      // let songs = data.songs
      // let $ol = this.$el.find('ol')
      // songs.map((song) => {
      //   let $li = $(this.template.replace('{{song.name}}', song.name)
      //     .replace('{{song.singer}}', song.singer)
      //     .replace('{{song.id}}', song.id)
      //     .replace('{{song.img}}', song.img))
      //   $ol.append($li)
      // })

      let {author,img,name,id} = data

      this.$el.html(this.template.replace('{{img}}',img)
        .replace('{{name}}',name)
        .replace('{{author}}',author))


      let songList = AV.Object.createWithoutData('SongList', id);
      let query = new AV.Query('Song');
      query.equalTo('dependent', songList);
      query.find().then( (songs)=> {
        songs.forEach( (song,i)=> {
          let _this = this

          let $li = $(this.liTemplate.replace('{{id}}',song.id)
            .replace('{{name}}',song.attributes.name)
            .replace('{{singer}}',song.attributes.singer)
            .replace('{{img}}',song.attributes.img))
          this.$el.find('main > ol').append($li)

          let audio = $(`<audio src="${song.attributes.url}"></audio>`)
          audio.on('canplay',function(){
            $li.find('.songTime').html(_this.secondsToMinutes(this.duration))
          })

        })
      })


    },
    liTemplate:`
       <li class="latestSong-content-list">
        <a href="./song.html?id={{id}}">
          <img
              src="{{img}}"
          >
          <div class="song-intro">
            <span class="songName">{{name}}</span>
            <span class="artistName">{{singer}}</span>
          </div>
          <span class="songTime">3:20</span>
        </a>
      </li>
    `,
    secondsToMinutes(second){
      let intSeconds = (second >> 0)
      let minutes = (intSeconds / 60) >> 0
      let seconds = intSeconds % 60
      seconds = seconds < 10 ? '0' + seconds : seconds
      return minutes + ':' + seconds
    }
  }

  let model = {
    data: {},
    find(id) {
      let query = new AV.Query('SongList')
      return query.get(id).then((song) => {
        this.data = {
          id: song.id,
          ...song.attributes
        }
      })
    }
  }

  let controller = {
    init(view, model) {
      this.view = view
      this.view.init()
      this.model = model
      let id = this.getId()
      this.model.find(id).then(() => {
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
    bindEvents(){
      this.view.$el.on('click','.returnButton',()=>{
        window.history.back()
      })
    }
  }

  controller.init(view, model)

}