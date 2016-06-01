function Client(connection) {
	this.connection = connection;
	this.id = this.connection.getId();
	this.name = this.connection.getId();
};

Client.prototype.getId = function() {
	return this.id;
};
Client.prototype.getName = function() {
	return this.name;
};
Client.prototype.getConnection = function() {
	return this.connection;
};
Client.prototype.setConnection = function(connection) {
	this.connection = connection;
};

module.exports = Client;