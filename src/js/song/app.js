{
  let view = {
    el: '#app',
    template: `
      <audio src="{{url}}"></audio>
      <button class="play">播放</button>
      <button class="pause">暂停</button>
    `,
    init(){
      this.$el = $(this.el)
    },
    render(data){
      
      this.$el.html(this.template.replace('{{url}}',data.url))
    },
    play(){
      this.$el.find('audio')[0].play()
    },
    pause(){
      this.$el.find('audio')[0].pause()
    },
  }

  let model = {
    data: {},
    setId(id) {
      this.data.id = id
    },
    getSongs(id) {
      let query = new AV.Query('Song')
      return query.get(id).then(function (song) {
        return {
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
      this.model.setId(id)
      this.model.getSongs(this.model.data.id).then((data) => {
        this.view.render(data)
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
    bindEvents(){
      this.view.$el.on('click','.play',()=>{
        this.view.play()
      })
      this.view.$el.on('click','.pause',()=>{
        this.view.pause()
      })
    }
  }

  controller.init(view, model)
}