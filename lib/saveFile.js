module.exports = saveFile

function saveFile (url, outFolder, cb) {
  var fs = require('fs')
  var path = require('path')
  var web = /^https/.test(url) ? require('https') : require('http')
  var writePath = path.join((outFolder || __dirname), path.basename(url))
  var write = fs.createWriteStream(writePath, {flags: 'w'})

  web.get(url, function download (res) { 
    res.pipe(write)
    res.on('end', function () {
      cb(null, writePath)
    })
  })
}