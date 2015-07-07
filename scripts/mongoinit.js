db.pixels.drop();
for(var i = 0; i < 5; i++) {
	for(var j = 0; j < 5; j++) {
		db.pixels.insert({x: i, y: j, reserved: false});
	}
}
