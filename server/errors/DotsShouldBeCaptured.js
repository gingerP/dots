const HttpStatus = require('http-status');
const ErrorCodes = require('./errors-codes');
const GenericError = require('./GenericError');

class DotsShouldBeCaptured extends GenericError {
    constructor(message) {
        super(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCodes.DotsShouldBeCaptured,
            message
        );
    }
};

module.exports = DotsShouldBeCaptured;