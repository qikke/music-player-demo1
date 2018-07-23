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
      id: ''
    },
    create(data) {
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
    update(data) {
      let song = AV.Object.createWithoutData('Song', this.data.id)

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
        this.view.render(this.model.data)
      })
      window.eventHub.on('selectNewSong', () => {
        if (this.model.data.id) {
          this.model.data = {
            name: '',
            singer: '',
            url: '',
            id: ''
          }
        }
        this.view.render(this.model.data)
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

        if (this.model.data.id) {
          this.model.update(data).then(()=>{
            alert("编辑成功！")
            window.eventHub.emit('uploaded', this.model.data)
          })
        } else {
          this.model.create(data).then(() => {
            alert("保存成功！")
            window.eventHub.emit('uploaded', this.model.data)
          })
        }
      })
    }
  }

  controller.init(view, model)
}