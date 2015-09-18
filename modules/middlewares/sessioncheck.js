
module.exports = function (req, res, next) {
	var user = req.body.session;
    if(!user) {
        res.send(JSON.stringify({status: "error"}));
        log.error("No session for the user");
    } else {
        dal.User.findOne({_id: user}, function (err, doc) {
            if(err || !doc) {
                res.send(JSON.stringify({status: "error"}));
                log.error("Invalid session: " + user);
            } else {
            	req.user = doc;
            	next();
            }
        });
    }
}