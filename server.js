var qiniu = require('qiniu')
var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var path = request.url
  var query = ''
  if (path.indexOf('?') >= 0) {
    query = path.substring(path.indexOf('?'))
    path = path.slice(0, path.indexOf('?'))
  }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method

  //----------------------------
  console.log('HTTP 路径为\n' + path)
  console.log('查询字符串为\n' + query)
  // console.log('不含查询字符串的路径为\n' + pathNoQuery)


  if (path === '/uptoken') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin', '*')

    var config = fs.readFileSync('./qiniu-key.json', 'utf8')
    config = JSON.parse(config)

    let {
      accessKey,
      secretKey
    } = config
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    var options = {
      scope: 'music-player-demo1',
      // returnBody:`{
      //   "Pragma": "no-cache",
      //   "Accept-Ranges": "bytes",
      //   "Content-Range": "bytes"
      // }`
    }
    // "Content-Type":"$ mimeType",
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);

    response.write(`{
      "uptoken":"${uploadToken}"
    }`)
    response.end()
  } else {
    response.statusCode = 404
    response.end()
  }


})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)