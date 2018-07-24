const cheerio = require('cheerio'),
      queue = require('./src/queue'),
      path = require('path'),
      fs = require('fs'),
      Crawler = require('./src/crawler'),
      printStats = require('./src/log/final');

let config, stats = {
  pageCount: 0,
  totalErrorCount: 0,
  startTime: new Date()
};

function discoverResources(buffer, item) {
  const page = cheerio.load(buffer.toString('utf8'))
  var links = page('a[href]').map(function () {
    return page(this).attr('href')
  }).get()

  if(config.limit){
    links = links.filter(function(s){
        return ~s.indexOf(config.limit);
    });
  }

  return links
}

module.exports = (options) => {
  console.log("ô¿ô light-mc-crawler has started crawling. If it looks like nothing is happening, wait, it is :)");

  config = JSON.parse(fs.readFileSync(path.resolve(options.config)))

  const lighthouseQueue = queue(config, stats);
  const crawler = Crawler(config);

  crawler.discoverResources = discoverResources;

  crawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
    lighthouseQueue.push(queueItem.url)
  });

  crawler.once('complete', () => {
    lighthouseQueue.drain = () => {
      printStats(stats)
      if (stats.totalErrorCount > 0) {
        process.exit(1)
      }
    }
  })

  crawler.start()
}