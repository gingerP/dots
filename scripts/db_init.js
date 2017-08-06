use dots;
db.createUser({user: "dots", pwd: "dots", roles: [{ role: "readWrite", db: "dots" }]});