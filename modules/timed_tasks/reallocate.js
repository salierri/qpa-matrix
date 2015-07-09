var _ = require("lodash");

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
		console.log("Start reallocating");
		reallocator.timer = Date.now() + config.reallocateTimer;
		setTimeout(doRealloc, config.reallocateTimer)
		dal.User.find().sort({hasPixel: 1, timer: 1}).exec(function (err, doc) {
			var needed = _.countBy(doc, function(n) { return n.hasPixel; } )["false"];
			var done = _.after(2 * Math.min(needed, doc.length - needed), function () {
				console.log("Done reallocating");
			});
			for(var i = 0; i < Math.min(needed, doc.length - needed); i++) {
				doc[i].hasPixel = true;
				doc[i]._pixel = doc[needed + i]._pixel;
				doc[i].timer = Date.now();
				doc[needed + i].hasPixel = false;
				doc[needed + i]._pixel = null;
				doc[needed + i].timer = Date.now();
				dal.User.update({_id: doc[i]._id}, doc[i], function (err) {
					done();
				});
				dal.User.update({_id: doc[needed + i]._id}, doc[needed + i], function (err) {
					done();
				});
			}
		});
	}

	return reallocator;
}

