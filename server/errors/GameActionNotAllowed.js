const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class GameActionNotAllowed extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.GameActionOfferDrawNotAllowed,
            message
        );
    }
}

module.exports = GameActionNotAllowed;