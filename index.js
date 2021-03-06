const cheerio = require('cheerio')
const ChildProcess = require('child_process')
const Crawler = require('simplecrawler')
const path = require('path')
const queue = require('async/queue')
const fs = require('fs')
const colors = require('colors')
const util = require('util')

const stats = {
  pageCount: 0,
  violationCounts: {},
  foundHttpLinks: {},
  passedAuditsCount: 0,
  startTime: null,
  auditTimesByPageUrl: {}
}

module.exports = (options) => {
  console.log("ô¿ô light-mc-crawler has started crawling. If it looks like nothing is happening, wait, it is :)");

  stats.startTime = new Date()

  const configPath = path.resolve(options.config)
  const config = JSON.parse(fs.readFileSync(configPath))

  const crawler = new Crawler(options.url || config.url)
  crawler.respectRobotsTxt = false
  crawler.parseHTMLComments = false
  crawler.parseScriptTags = false
  crawler.userAgent = options.userAgent || "light-mc-crawler Mixed Content Crawler"
  crawler.maxDepth = config.maxDepth || 1


  crawler.discoverResources = (buffer, item) => {
    const page = cheerio.load(buffer.toString('utf8'))
    var links = page('a[href]').map(function () {
      return page(this).attr('href')
    }).get()

    if(config.limit){
      links = links.filter(function(s){
          return ~s.indexOf(config.limit);
      });
    }

    if(config.showHttpLinksDuring || config.showHttpLinksAfter){
      links.forEach(function(link) {
          if(link.indexOf('http://') !== -1){
            if(!stats.foundHttpLinks[item.url]){
              stats.foundHttpLinks[item.url] = [];
            }

            stats.foundHttpLinks[item.url].push(link)
          }
      });

      if(config.showHttpLinksDuring && stats.foundHttpLinks[item.url]){
        console.log();
        console.log('Http link(s) on '.bold.underline + item.url.bold.underline);
        stats.foundHttpLinks[item.url].forEach(function(link) {
          console.log('  ' + link);
        });
      }
    }

    return links
  }

  let totalErrorCount = 0

  const lighthouseQueue = queue((url, callback) => {
    runLighthouse(url, config, (errorCount) => {
      totalErrorCount += errorCount
      callback()
    })
  }, config.maxChromeInstances || 5)

  crawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
    lighthouseQueue.push(queueItem.url)
  })

  crawler.once('complete', () => {
    lighthouseQueue.drain = () => {
      printStats(config)
      if (totalErrorCount > 0) {
        process.exit(1)
      }
    }
  })

  crawler.start()
}

function runLighthouse (url, config, callback) {
  if(config.httpsOnly){
    url = url.replace("http://", "https://");
  }

  stats.pageCount++
  var mixedContent = require.resolve('lighthouse/lighthouse-core/config/mixed-content.js')
  var chromeFlags = config.chromeFlags || '--headless --disable-gpu';
  var userAgent = config.userAgent || 'light-mc-crawler Mixed Content Crawler'
  const args = [
    url,
    '--output=json',
    '--output-path=stdout',
    '--disable-device-emulation', 
    '--disable-cpu-throttling',
    '--disable-storage-reset', 
    '--disable-network-throttling',
    '--chrome-flags=' + chromeFlags + '--user-agent=' + userAgent,
    `--config-path=${mixedContent}`
  ]

  const lighthousePath = require.resolve('lighthouse/lighthouse-cli/index.js')
  const lighthouse = ChildProcess.spawn(lighthousePath, args)

  let output = ''
  lighthouse.stdout.on('data', (data) => {
    output += data
  })

  stats.auditTimesByPageUrl[url] = {startTime: new Date()}
  lighthouse.once('close', () => {
    stats.auditTimesByPageUrl[url].endTime = new Date()
    let errorCount = 0

    let report
    try {
      report = JSON.parse(output)
    } catch (parseError) {
      console.log();
      if(output != ''){
        console.error(`Parsing JSON report output failed for ${url}: ${output}`);
        console.log(parseError);
      } else{
        console.error(`Lighthouse report returned nothing for ${url}`);
      }

      callback(1)
      return
    }

    report.reportCategories.forEach((category) => {
      let displayedCategory = false
      category.audits.forEach((audit) => {
        if(audit.id != "is-on-https"){
          //mixed-content is buggy atm, will work on fixing.
          //is-on-https seems to surface everything well enough
          return;
        }

        if (audit.score === 100) {
          stats.passedAuditsCount++
        } else {
          if (!displayedCategory) {
            console.log();
            console.log(category.name.bold.underline + ` current page count: ${stats.pageCount}`);
            displayedCategory = true
          }
          errorCount++
          console.log(url.replace(/\/$/, ''), '\u2717'.red, audit.id.bold, '-', audit.result.description.italic)

          if (stats.violationCounts[category.name] === undefined) {
            stats.violationCounts[category.name] = 0
          }

          if (audit.result.extendedInfo) {
            const {value} = audit.result.extendedInfo
            if (Array.isArray(value)) {
              stats.violationCounts[category.name] += value.length
              value.forEach((result) => {
                if (result.url) {
                  console.log(`   ${result.url}`)
                }
              })
            } else if (Array.isArray(value.nodes)) {
              stats.violationCounts[category.name] += value.nodes.length
              const messagesToNodes = {}
              value.nodes.forEach((result) => {
                let message = result.failureSummary
                message = message.replace(/^Fix any of the following:/g, '').trim()
                if (messagesToNodes[message]) {
                  messagesToNodes[message].push(result.html)
                } else {
                  messagesToNodes[message] = [result.html]
                }
              })
              Object.keys(messagesToNodes).forEach((message) => {
                console.log(`   ${message}`)
                messagesToNodes[message].forEach(node => {
                  console.log(`     ${node}`.gray)
                })
              })
            } else {
              stats.violationCounts[category.name]++
            }
          }else if(audit.result.details && audit.result.details.items){
            audit.result.details.items.forEach((result) => {
              if (result[0].text) {
                console.log(`   ${result[0].text}`)
              }
            })
          }
        }
      })
    })

    callback(errorCount)
  })
}

function printStats(config) {
  console.log();
  console.log();
  if(config.showHttpLinksAfter){
    for(var index in stats.foundHttpLinks) { 
        console.log('Http link(s) on '.bold.underline + index.bold.underline);
        stats.foundHttpLinks[index].forEach(function(link) {
          console.log('  ' + link);
        });
    }
  }
  console.log();
  console.log();
  console.log('Lighthouse Summary'.bold.underline);
  console.log(`  Total Pages Scanned: ${stats.pageCount}`);
  console.log(`  Total Auditing Time: ${new Date() - stats.startTime} ms`);
  const totalTime = Object.keys(stats.auditTimesByPageUrl).reduce((sum, url) => {
    const {endTime, startTime} = stats.auditTimesByPageUrl[url]
    return (endTime - startTime) + sum
  }, 0)
  console.log(`  Average Page Audit Time: ${Math.round(totalTime/stats.pageCount)} ms`);
  console.log(`  Total Audits Passed: ${stats.passedAuditsCount}`, '\u2713'.green);
  if (Object.keys(stats.violationCounts).length === 0) {
    console.log(`  Total Violations: None! \\o/ 🎉`);
  } else {
    console.log(`  Total Violations:`);
    Object.keys(stats.violationCounts).forEach(category => {
      console.log(`    ${category}: ${stats.violationCounts[category]}`, '\u2717'.red);
    })
  }
}
