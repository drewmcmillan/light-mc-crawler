module.exports = function (stats) {
	console.log('');
	console.log('');
	console.log('Lighthouse Summary');
	console.log(`  Total Pages Scanned: ${stats.pageCount}`);
	console.log(`  Total Auditing Time: ${new Date() - stats.startTime} ms`);
}