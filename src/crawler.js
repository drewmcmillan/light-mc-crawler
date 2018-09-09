const Crawler = require('simplecrawler');

module.exports = function (config) {
	const crawler = new Crawler(config.url)
	crawler.respectRobotsTxt = false
	crawler.parseHTMLComments = false
	crawler.parseScriptTags = false
	crawler.userAgent = config.userAgent || "light-mc-crawler Mixed Content Crawler"
	crawler.maxDepth = config.maxDepth || 1;

	return crawler;
}