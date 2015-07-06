module.exports = Extractor

var EventEmitter = require('events').EventEmitter
var util = require('util')
var spawn = require('child_process').spawn
var StreamSplitter = require('stream-splitter')

util.inherits(Extractor, EventEmitter)

function Extractor (filePath) {
  var self = this
  var doc = spawn('pdftotext', [filePath, '-'])
  var out = []
  var thumbs = []
  var article = false
  var split = doc.stdout.pipe(StreamSplitter('\n'))

  split.on('token', function (data) {
    var line = data.toString()
    if (/^THUMBS (UP|DOWN)/.test(line)) {
      article = true
      thumbs.push(filePath)
      return thumbs.push(line)
    }

    if (article && /^[A-Z0-9][A-Z0-9]+/.test(line)) {
      article = false
      if (thumbs.length) {
        while (thumbs[thumbs.length - 1] === '') { thumbs.pop() }
        self.emit('data', thumbs)
        thumbs = []
        return
      }
    }

    if (article) return thumbs.push(line)
  })

  split.on('end', function () { self.emit('end') })
}