const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class GameNotFoundError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.BAD_REQUEST,
            ErrorCodes.GameNotFoundError,
            message
        );
    }
}

module.exports = GameNotFoundError;