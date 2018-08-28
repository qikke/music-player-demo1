{
  let view = {
    el: '.page>main',
    template: `
    <form class="form">
      <div class="row">
        <label>歌名
          <input type="text" value="__name__" name="name">
        </label>
      </div>
      <div class="row" >
        <label>歌手
          <input type="text" value="__singer__" name="singer">
        </label>
      </div>
      <div class="row">
        <label>外链
          <input type="text" value="__url__" name="url">
        </label>
      </div>
      <div class="row">
        <label>图片
          <input type="text" value="__img__" name="img">
        </label>
      </div>
      <div class="row">
        <label>歌词
          <textarea name="lyrics" cols="100" rows="15">__lyrics__</textarea>
        </label>
      </div>
      <div class="row">
        <label>所属歌单
          <input type="text" value="__songList__" name="songList">
        </label>
      </div>
      <div class="row">
        <label>歌单封面
          <input type="text" value="__songListImg__" name="songListImg">
        </label>
      </div>
      <div class="row">
        <button type="submit">保存</button>
      </div>
    </form>`,
    init() {
      this.$el = $(this.el)
    },
    render: function (data = {}) {
      let placeholders = ['name', 'singer', 'url', 'id', 'img','lyrics','songList','songListImg']
      let html = this.template
      placeholders.forEach((value) => {
        html = html.replace(`__${value}__`, data[value] || '')
      })
      $(this.el).html(html)
      if (data.id) {
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
    },
  }

  let model = {
    data: {
      name: '',
      singer: '',
      url: '',
      id: '',
      img: '',
      songList:'',
      songListImg:''
    },
    create(data) {
      let Song = AV.Object.extend('Song')
      let song = new Song()
      return song.save({
        name: data.name,
        singer: data.singer,
        url: data.url,
        img: data.img,
        lyrics:data.lyrics,
        dependent:data.songList
      }).then((newSong) => {
        let {
          id,
          attributes
        } = newSong
        Object.assign(this.data, {
          id,
          ...attributes
        })
      })
    },
    update(data) {
      let song = AV.Object.createWithoutData('Song', this.data.id)
      return song.save({
        name: data.name,
        singer: data.singer,
        url: data.url,
        img: data.img,
        lyrics:data.lyrics,
        dependent:data.songList
      }).then((newSong) => {
        let {
          id,
          attributes
        } = newSong
        Object.assign(this.data, {
          id,
          ...attributes
        })
      })
    },
    isSongListExit(songList,songListImg){
      let SongList =  new AV.Query('SongList');
      SongList.exists('name');
      return SongList.find().then(function (results) {
        for(let i = 0; i < results.length; i++){
          if(results[i].attributes.name === songList){
            return (function(i){
              results[i].set('img',songListImg)
              results[i].save().then(()=>{
              },(error)=>{
                console.log(error)
              })
              return results[i]
            })(i)
          }
        }
        return false
      }, function (error) {
        console.log(error)
      })
    },
    getSongList(id){
      let query = new AV.Query('SongList')
      return query.get(id).then((songList) =>{
        return {
          songList:songList.get('name'),
          songListImg:songList.get('img')
        }
      }, function (error) {
        console.log(error)
      });
    }
  }

  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.init()
      this.view.render()
      this.bindEvents()
      //订阅upload
      window.eventHub.on('upload', (data) => {
        Object.assign(this.model.data, data)
        this.view.render(data)
      })
      window.eventHub.on('select', (data) => {
        this.model.data = data
        this.model.getSongList(data.dependent.objectId).then((obj)=>{
          Object.assign(this.model.data,obj)
          this.view.render(this.model.data)
        })

      })
      window.eventHub.on('selectNewSong', () => {
        if (this.model.data.id) {
          this.model.data = {
            name: '',
            singer: '',
            url: '',
            id: '',
            img: '',
            lyrics:'',
            songList:'',
            songListImg:''
          }
        }
        this.view.render(this.model.data)
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
        let needs = ['name', 'singer', 'url', 'img','lyrics','songList','songListImg']
        let data = {}
        needs.map((string) => {
          data[string] = this.view.$el.find(`[name=${string}]`).val()
        })

        this.model.isSongListExit(data.songList,data.songListImg).then((songList)=>{
          //if songList is not exist
          console.log(songList)
          if(!songList){
            songList = new AV.Object('SongList');
            songList.set('name', data.songList);
            songList.set('img', data.songListImg);
          }
          data.songList = songList
          if (this.model.data.id) {
            this.model.update(data).then(() => {
              window.eventHub.emit('created', this.model.data)
              alert("编辑成功！")
            })
          } else {
            this.model.create(data).then(() => {
              window.eventHub.emit('created', this.model.data)
              alert("保存成功！")
            })
          }
        })
      })
    }
  }

  controller.init(view, model)
}