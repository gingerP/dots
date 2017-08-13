const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class CouldNotCancelGameError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.CouldNotCancelGameError,
            message
        );
    }
}

module.exports = CouldNotCancelGameError;