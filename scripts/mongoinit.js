db.pixels.drop();
for(var i = 0; i < 5; i++) {
	for(var j = 0; j < 5; j++) {
		db.pixels.insert({x: i, y: j, reserved: false});
	}
}

db.tasks.drop();
db.tasks.insert({name: "reallocate", lastRun: null});
db.tasks.insert({name: "kick", lastRun: null});
db.tasks.insert({name: "autocolor", lastRun: null});