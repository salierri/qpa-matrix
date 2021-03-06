var _ = require("lodash");

module.exports = function (dal, config) {
	var reallocator = {};

	// > 0: real timer, -1: no timer, -2: timer initiated, waiting for async callback
	reallocator.timer = -1;

	reallocator.when = function (callback) {
		if(reallocator.timer == -1) {
			callback(false);
		} else if(reallocator.timer == -2) {
			setTimeout(function () {
				dal.Task.findOne({name: 'reallocate'}, function (err, doc) {
					if(!doc.next_run) {
						callback(reallocator.timer - Date.now());
					} else {
						log.verbose("Reallocator timer waited for async, timer is: " + (doc.next_run.getTime() - Date.now()));
						callback(doc.next_run.getTime() - Date.now());
					}
				});
			}, 100);
		} else {
			dal.Task.findOne({name: 'reallocate'}, function (err, doc) {
				if(!doc.next_run) {
					callback(reallocator.timer - Date.now());
				} else {
					log.verbose("Reallocator timer from DB, timer is: " + (doc.next_run.getTime() - Date.now()));
					callback(doc.next_run.getTime() - Date.now());
				}
			});
		}
	}

	reallocator.needRealloc = function () {
		log.verbose("Realloc needed, current timer: " + reallocator.timer);
		if(reallocator.timer == -1) {
			reallocator.timer = -2;
			dal.Task.findOne({name: 'reallocate'}, function (err, doc) {
				if(doc.next_run == null || doc.next_run.getTime() < Date.now() - 1000) {
					reallocator.timer = Date.now() + config.reallocateTimer;
					setTimeout(doRealloc, config.reallocateTimer);
					dal.Task.findOneAndUpdate({name: 'reallocate', next_run: doc.next_run}, {next_run: Date.now() + config.reallocateTimer}, function (err, doc) {
						log.info("Reallocate timer started");
					});
				} else {
					reallocator.timer = doc.next_run.getTime();
					setTimeout(doRealloc, doc.next_run.getTime() + 500);
				}
			});
		}
	}

	function doRealloc() {
		log.verbose("Reallocation initiated");
		reallocator.timer = Date.now() + config.reallocateTimer;
		setTimeout(doRealloc, config.reallocateTimer);
		dal.Task.findOne({name: 'reallocate'}, function (err, doc) {
			if(doc.last_run == null || doc.last_run.getTime() < (Date.now() - config.reallocateTimer + 100)) {
				dal.Task.findOneAndUpdate({name: 'reallocate', last_run: doc.last_run}, {last_run: Date.now(), next_run: Date.now() + config.reallocateTimer}, function (err, doc) {
					if(doc != null) {
						log.info("Start reallocating");
						dal.Pixel.find({reserved: false}, function (err, empty) {
							log.verbose("Empty pixels: " + empty.length);
							dal.User.find().sort({hasPixel: 1, timer: 1}).exec(function (err, doc) {
								log.verbose("Users at the start of the reallocation:");
								if(config.verbose) {
									console.dir(doc);
								}
								var needed = _.countBy(doc, function(n) { return n.hasPixel; } )["false"];
								var done = _.after(2 * Math.min(needed, doc.length - needed + empty.length), function () {
									log.info("Done reallocating");
								});
								for(var i = 0; i < Math.min(needed, doc.length - needed + empty.length); i++) {
									doc[i].hasPixel = true;
									doc[i].timer = Date.now();
									if(i < empty.length) {
										doc[i]._pixel = empty[i]._id;	
									} else {
										var takenFrom = needed + i - empty.length;
										doc[i]._pixel = doc[takenFrom]._pixel;
										doc[takenFrom].hasPixel = false;
										doc[takenFrom]._pixel = null;
										doc[takenFrom].timer = Date.now();
										dal.User.update({_id: doc[takenFrom]._id}, doc[takenFrom], function (err) {
											done();
										});
									}
									dal.User.update({_id: doc[i]._id}, doc[i], function (err) {
										done();
									});
								}
								log.verbose("Users at the end of the reallocation:");
								if(config.verbose) {
									console.dir(doc);
								}
							});
						})
					}
				});
			}
		});
	}

	return reallocator;
}

