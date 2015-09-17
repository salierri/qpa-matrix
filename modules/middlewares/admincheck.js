
module.exports = function (req, res, next) {
	var key = req.headers["bfb-admin-key"];
    if(key !== config.adminkey) {
        res.send(JSON.stringify({status: "error"}));
        console.log("Wrong admin password attempt: " + req.headers["bfb-admin-key"]);        
    } else {
        next();
    }
}