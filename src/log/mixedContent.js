module.exports = function (results, stats) {

	if(!results){
		console.log('NO RESULTS?');
	}

	stats.pageCount++;

	if(results.value == false){
		stats.totalErrorCount++;

		console.log(' ')
		console.log('Mixed Content Found! ' + results.url + " (" + stats.pageCount + ")");

		results.causes.forEach( function(element) {
			console.log('        ' + element);
		});
	}
}