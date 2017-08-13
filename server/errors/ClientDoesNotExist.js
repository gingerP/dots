const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class ClientDoesNotExistError extends GenericError {
    constructor(message) {
        super(
            HttpStatus.BAD_REQUEST,
            ErrorCodes.ClientNotFoundError,
            message
        );
    }
}

module.exports = ClientDoesNotExistError;