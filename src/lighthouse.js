const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const mixedContentConfig = require('./mixed-content-config');

module.exports = function (url, config) {
  console.log('lighthouse - ' + url);

  const opts = {
    disableDeviceEmulation: true,
    disableCpuThrottling: true,
    disableStorageReset: true,
    disableNetworkThrottling: true,
    chromeFlags: config.chromeFlags || ['--show-paint-rects', '--no-sandbox', '--user-data-dir', '--headless', '--disable-setuid-sandbox', '--disable-gpu'],
    userAgent: config.userAgent || 'light-mc-crawler Mixed Content Crawler'
  };

  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, mixedContentConfig).then(results => {
      return chrome.kill()
              .then(() => results)
              .then(results => {
                let result = {
                  url: url,
                  value: results['audits']['is-on-https']['score'],
                  causes: []
                }

                if(result.value != true){
                  results['audits']['is-on-https']['details']['items'].forEach(function(el) {
                    result.causes.push(el.text);
                  });
                }

                return result
              }).catch(function(reason) {
        console.log('EERRRR 2');
        console.log(reason);
        console.log('EERRRR 2-');
    });
    }).catch(function(reason) {
        console.log('EERRRR 1');
        console.log(reason);
        console.log('EERRRR 1-');
    });
  }).catch(function(reason) {
        console.log('EERRRR 3');
        console.log(reason);
        console.log('EERRRR 3-');
    });
}