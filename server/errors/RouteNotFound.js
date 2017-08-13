const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class RouteNotFoundError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.NOT_FOUND,
            ErrorCodes.RouteNotFoundError,
            message
        );
    }
}

module.exports = RouteNotFoundError;