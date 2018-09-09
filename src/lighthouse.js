const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const mixedContentConfig = require('./mixed-content-config');

module.exports = function (url, config) {
  const opts = {
    disableDeviceEmulation: true,
    disableCpuThrottling: true,
    disableStorageReset: true,
    disableNetworkThrottling: true,
    chromeFlags: config.chromeFlags || ["--show-paint-rects", "--no-sandbox", "--user-data-dir", "--headless", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
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
            value: results['lhr']['audits']['is-on-https']['score'],
            causes: []
          }

          if(result.value != true){
            results['lhr']['audits']['is-on-https']['details']['items'].forEach(function(el) {
              result.causes.push(el.text);
            });
          }

          return result
        }).catch(function(err) {
            console.log(err);
        });
    }).catch(function(err) {
        console.log(err);
    });
  }).catch(function(err) {
      console.log(err);
  });
}