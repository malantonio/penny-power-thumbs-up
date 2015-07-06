var util = require('util')
var EventEmitter = require('events').EventEmitter

util.inherits(Harvester, EventEmitter)
module.exports = Harvester

function Harvester (url, linkExtensions) {
  var fs = require('fs')
  var path = require('path')
  var cheerio = require('cheerio')
  var web = /^https/.test(url) ? require('https') : require('http')
  var self = this
  var fileUrls

  if (!Array.isArray(linkExtensions)) linkExtensions = [linkExtensions]

  linkExtensions = linkExtensions.map(function dropPeriods (ext) {
    return ext.replace(/^\./, '')
  })

  web.get(url, function (res) {
    var body = ''

    res.setEncoding('utf8')

    res.on('data', function addToBody (chunk) {
      console.log(chunk.toString())
      body += chunk.toString()
    })

    res.on('end', function parseDom () {
      var $ = cheerio.load(body)
      var $links = $('a')
      var extReg = new RegExp('\\.(' + linkExtensions.join('|') + ')')
      var urls = []

      function hasExt() { return extReg.test(this.attribs.href) }
      function addUrl() { return url + this.attribs.href }

      $links
        .filter(hasExt)
        .map(addUrl)
        .toArray()
        .forEach(function emitUrls (fullUrl) {
          self.emit('data', fullUrl)
          urls.push(fullUrl)
        })

      self.emit('end', urls)
    })
  })
}