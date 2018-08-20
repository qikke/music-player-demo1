{
  let view = {
    el: '#slide',
    init() {
      this.$el = $(this.el)
      this.wrapper = this.$el.find('.wrapper')
      this.imgs = this.$el.find('img')
      this.imgWidth = this.imgs.eq(1).width()
      this.buttons = this.$el.find('span')
    }
  }

  let controller = {
    n: 0,
    timer: null,
    speed: 2500,

    init(view) {
      this.view = view
      this.view.init()

      this.view.wrapper.append(this.view.imgs.first().clone())
      this.view.wrapper.prepend(this.view.imgs.last().clone())

      this.view.wrapper.css({
        left: '-' + this.view.imgWidth + 'px'
      })
      this.bindEvents()
      this.start()
    },
    start() {
      this.timer = setInterval(() => {
        this.changeTo(++this.n)
      }, this.speed)
      return this
    },
    changeTo(index) {
      this.view.buttons.removeClass('active').eq(index - 1).addClass('active')
      this.view.wrapper.animate({
          left: '-' + this.view.imgWidth * this.n + 'px'
        },
        500,
        'swing',
        () => {
          if (++index === this.view.imgs.length + 1) {
            this.n = 0
            this.view.wrapper.css({
              left: '0'
            })
          }
        })
    },
    bindEvents() {
      //用户缩小页面时，停止计时器，防止出现bug
      $(document).on('visibilitychange', () => {
        if (document.hidden) {
          window.clearInterval(this.timer)
        } else {
          this.start()
        }
      })

      this.view.$el.on('touchstart', () => {
        window.clearInterval(this.timer)
      })
      this.view.$el.on('touchend', () => {
        this.start()
      })

      //绑定按钮事件
      for (let i = 0; i < this.view.buttons.length; i++) {
        let _this = this
        _this.view.buttons.eq(i).on('click', (function (i) {
          return function () {
            _this.n = i
            _this.changeTo(++_this.n)
          }
        })(i))
      }
    }
  }

  controller.init(view)
}