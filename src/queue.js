const queue = require('async/queue'),
	  handleResults = require('./log/mixedContent'),
	  lighthouse = require('./lighthouse');

module.exports = function (config, stats) {
	return queue((url, callback) => {
	  lighthouse(url, config).then(results => {
	    handleResults(results, stats);
	    callback();
	  });
	}, config.maxChromeInstances || 5);
}