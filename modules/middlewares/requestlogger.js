exports.logrequest = function(conf) {
    return function(req,res,next) {
        console.log((new Date()).toISOString() + "\t" + req.method + "\t" + req.url);
        next();
    };
}
