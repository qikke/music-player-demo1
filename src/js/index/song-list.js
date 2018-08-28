{
  let view ={
    el:'.songList .list',
    template:`
       <li>
        <a href="./song-list.html?id={{id}}">
         <img
              src="{{img}}"
              class="songListImg">
          <span class="songName">{{name}}</span>
          <span class="artistName">by {{author}}</span>
        </a>
       </li>
    `,
    init(){
      this.$el = $(this.el)
    },
    render(data){
      data.map((songList)=>{
        let {img,name,author,id} = songList
        let $li = $(this.template.replace('{{img}}',img)
          .replace('{{name}}',name)
          .replace('{{author}}',author)
          .replace('{{id}}',id))
        this.$el.append($li)
      })
    }
  }

  let model = {
    data:{},
    getData(){
      let query = new AV.Query('SongList')
      return query.find().then((songs) => {
        this.data = songs.map((song) => {
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
    init(view,model){
      this.view = view
      this.view.init()
      this.model = model
      this.model.getData().then(()=>{
        this.view.render(this.model.data)
        this.bindEvents()
      })
    }
  }

  controller.init(view,model)
}