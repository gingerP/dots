const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class GameActionOfferCompleteNotAllowed extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.GameActionOfferCompleteNotAllowed,
            message
        );
    }
}

module.exports = GameActionOfferCompleteNotAllowed;