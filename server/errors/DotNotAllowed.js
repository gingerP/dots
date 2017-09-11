const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class DotNotAllowed extends GenericError {
    constructor(message) {
        super(
            HttpStatus.FORBIDDEN,
            ErrorCodes.DotNotAllowed,
            message
        );
    }
}

module.exports = DotNotAllowed;