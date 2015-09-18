var _ = require('lodash');

module.exports = function (dal, config) {
	setInterval(function () {
		dal.Task.findOne({name: 'kick'}, function (err, doc) {
			if(doc.last_run == null || doc.last_run.getTime() < Date.now() + 100) {
				dal.Task.findOneAndUpdate({name: 'kick', last_run: doc.last_run}, {last_run: Date.now()}, function (err, doc) {
					if(doc != null) {
						log.verbose("Kicking inactive users");
						dal.User.find({lastUpdate : {$lt: Date.now() - config.timeout}}, function (err, doc) {
							if(doc.length > 0) {
								log.verbose("Kicking users: " + _.pluck(doc, '_id'));
								dal.User.remove({_id: {$in: _.pluck(doc, '_id')}}, function (err, removed) {
									if(removed > 0) {
										log.info(removed + " user kicked");
									}
								});
								dal.Pixel.update({_id: {$in: _.pluck(doc, '_pixel')}}, {reserved: false}, {multi: true}, function (err, doc) {
									//
								});
							}
						});
					}
				});
			}
		});
	}, 5000);
}