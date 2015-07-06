
module.exports = function (dal, config) {
	var reallocator = {};

	reallocator.timer = 0;

	reallocator.needRealloc = function () {
		if(reallocator.timer == 0) {
			reallocator.timer = Date.now() + config.reallocateTimer;
			setTimeout(doRealloc, config.reallocateTimer);
		}
	}

	function doRealloc() {
		setTimeout(doRealloc, config.reallocateTimer)
		dal.Pixel.find({}, function (err, doc) {
			//TODO
		});
	}

	return reallocator;
}

