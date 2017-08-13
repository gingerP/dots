const _ = require('lodash');

class GenericError extends Error {
    constructor(status, code, message) {
        const preparedMessage = _.isError(message) ? message.message : message;
        super(preparedMessage);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.status = status;
        this.code = code;
        this.message = preparedMessage;
    }
}

module.exports = GenericError;