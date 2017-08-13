const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class RequestValidationError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.BAD_REQUEST,
            ErrorCodes.RequestValidationError,
            message
        );
    }
}

module.exports = RequestValidationError;