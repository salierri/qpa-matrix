exports.logrequest = function(conf) {
    return function(req,res,next) {

        if (!conf.logrequests) {
            req.reqid = "\t";
            next();
            return;
        }
        var start = Date.now();
        var reqid = req.ip + "\t";
        req.reqid = reqid;
        if (!conf.logrequestsverbose) {
            console.log(req.method + "\t" + req.url + "\t" + " request arrived.");
        } else {
            console.log(req.method + "\t" + req.url + "\t" + " request arrived. Body: " + JSON.stringify(req.body));
        }
        res.on('finish', function() {
            var time = Date.now() - start;
            console.log(reqid + req.method + "\t" + req.url + "\t" + res.statusCode +  "\t"+ time + "\t" + res._length);
        });
        next();
    };
}
