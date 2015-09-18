var _ = require('lodash');

module.exports = function (dal, config) {
	setInterval(function () {
		dal.Task.findOne({name: 'autocolor'}, function (err, doc) {
			if(doc.last_run == null || doc.last_run.getTime() < Date.now() + 100) {
				dal.Task.findOneAndUpdate({name: 'autocolor', last_run: doc.last_run}, {last_run: Date.now()}, function (err, doc) {
					if(doc != null) {
						log.verbose("Autocolor started");
						dal.Pixel.find({reserved: false}, function (err, doc) {
							var num = 0;
							doc.forEach(function (pixel) {
								if(Math.random() < config.autocolor.volume) {
									num++;
									dal.Pixel.findOneAndUpdate({_id: pixel._id}, {color: {
										r: Math.floor(Math.random() * 255),
										g: Math.floor(Math.random() * 255),
										b: Math.floor(Math.random() * 255)
									}}, function (err, doc) {
									});
								}
							});
							log.info("Autocolored " + num + " pixels");
						});
					}
				});
			}
		});
	}, config.autocolor.interval);
}