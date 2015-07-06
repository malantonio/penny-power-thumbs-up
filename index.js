var Harvester = require('./lib/harvester')
var Extractor = require('./lib/extractor')
var saveFile = require('./lib/saveFile')

var mkdirp = require('mkdirp')
var tmpFolder = './tmp'

mkdirp.sync(tmpFolder)

var fileCount = 0


var level = require('level')
var db = level('./db')

var url = 'http://www.pennypowerads.com'
var extensions = ['pdf']

var h = new Harvester(url, extensions)

h.on('data', function (url) {
  saveFile(url, tmpFolder, function (err, filePath) {
    var ex = new Extractor(filePath)

    ex.on('data', function (entry) {
      db.put(generateKey(), JSON.stringify(entry), function (err) {
        
      })
    })
  })
})

function generateKey() {
  var date = new Date()

  return date.getFullYear()
       + zeroPad(date.getMonth() + 1, 2)
       + zeroPad(date.getDate(), 2)
       + '-'
       + ++fileCount
}

function zeroPad(num, places) {
  var out = num.toString()

  while(out.length < places) {
    out = '0' + out
  }

  return out
}