db.users.drop();
db.pixels.drop();
for(var i = 0; i < 2; i++) {
	for(var j = 0; j < 2; j++) {
		db.pixels.insert({x: i, y: j, reserved: false});
	}
}

db.tasks.drop();
db.tasks.insert({name: "reallocate", last_run: null, next_run: null});
db.tasks.insert({name: "kick", last_run: null, next_run: null});
db.tasks.insert({name: "autocolor", last_run: null, next_run: null});