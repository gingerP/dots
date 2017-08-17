const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class ClientNotBelongToGameError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.ClientNotBelongToGameError,
            message
        );
    }
}

module.exports = ClientNotBelongToGameError;