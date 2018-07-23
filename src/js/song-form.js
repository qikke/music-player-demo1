{
  let view = {
    el: '.page>main',
    template: ` <h1>新建歌曲</h1>
    <form class="form">
      <div class="row">
        <label>歌名
          <input type="text" value="__name__" name="name">
        </label>
      </div>
      <div class="row" >
        <label>歌手
          <input type="text" value="__singer__" name = "singer">
        </label>
      </div>
      <div class="row">
        <label>外链
          <input type="text" value="__url__" name="url">
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
      let placeholders = ['name', 'singer', 'url', 'id']
      let html = this.template
      placeholders.forEach((value) => {
        html = html.replace(`__${value}__`, data[value] || '')
      })
      $(this.el).html(html)
    },
    reset() {
      this.render()
    }
  }

  let model = {
    data: {
      name: '',
      singer: '',
      url: '',
      id: ''
    },
    upload(data) {
      let Song = AV.Object.extend('Song');
      let song = new Song();
      return song.save({
        name: data.name,
        singer: data.singer,
        url: data.url
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
    fetch() {}
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
        this.view.render(data)
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', (e) => {
        e.preventDefault()
        let needs = ['name', 'singer', 'url']
        let data = {}
        needs.map((string) => {
          data[string] = this.view.$el.find(`input[name=${string}]`).val()
        })
        this.model.upload(data).then(() => {
          alert("保存成功！")
          this.view.reset()
          window.eventHub.emit('uploaded',this.model.data)
        })
      })
    }
  }

  controller.init(view, model)
}