const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class GameNotActiveError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.GameNotActiveError,
            message
        );
    }
}

module.exports = GameNotActiveError;