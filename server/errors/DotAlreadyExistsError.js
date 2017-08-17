const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class DotAlreadyExistsError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.BAD_REQUEST,
            ErrorCodes.DotAlreadyExistsError,
            message
        );
    }
}

module.exports = DotAlreadyExistsError;