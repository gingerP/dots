const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class InternalError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCodes.InternalError,
            message
        );
    }
}

module.exports = InternalError;