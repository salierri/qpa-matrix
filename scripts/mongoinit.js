db.pixels.drop();
for(var i = 0; i < 10; i++) {
	for(var j = 0; j < 10; j++) {
		db.pixels.insert({x: i, y: j, reserved: false});
	}
}

db.pixels.update({}, {$set:{reserved:false}},false,true)