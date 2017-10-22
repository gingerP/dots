const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class GameActionGaveUpNotAllowed extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.GameActionGaveUpNotAllowed,
            message
        );
    }
}

module.exports = GameActionGaveUpNotAllowed;