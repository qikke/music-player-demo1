{
  let view = {
    el: '.globalTabs',
    init() {
      this.$el = $(this.el)
    },
    addClass(index) {
      this.$el.find('li').eq(index).addClass('active').siblings('.active').removeClass('active')
    }
  }

  let controller = {
    init(view) {
      this.view = view
      this.view.init()
      this.bindEvents()
    },
    bindEvents() {
      this.view.$el.on('click', 'li', (e) => {
        let $li = $(e.currentTarget)
        let index = $li.index()
        this.view.addClass(index)
        window.eventHub.emit('tabClick', {
          index: index
        })
      })
    }
  }

  controller.init(view)
}