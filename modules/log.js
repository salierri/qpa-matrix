
module.exports = function (dal, config) {
	var logger = {};

	logger.verbose = function (string) {
		if(config.verbose) {
			console.log((new Date()).toISOString() + "\t" + string);
		}
	}

	logger.info = function (string) {
		console.log((new Date()).toISOString() + "\t" + string);
	}

	logger.error = function (string) {
		console.log((new Date()).toISOString() + "\tERROR\t" + string);
	}

	return logger;
}
