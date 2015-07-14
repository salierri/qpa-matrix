
module.exports = function (dal, config) {
	setInterval(function () {
		dal.Task.findOne({name: 'kick'}, function (err, doc) {
			if(doc.last_run == null || doc.last_run.getTime() < Date.now() + 100) {
				dal.Task.findOneAndUpdate({name: 'kick', last_run: doc.last_run}, {last_run: Date.now()}, function (err, doc) {
					if(doc != null) {
						dal.User.remove({lastUpdate < Date.now() - config.timeout}, function (err, doc) {
							console.log(doc);
						});
					}
				});
			}
		});
	}, 5000);
}