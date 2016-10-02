'use strict';

function getError(code, message) {
    return {
        error: {
            code: code,
            message: message
        }
    };
}

module.exports = {
    noAccess: getError(500, 'No access operation')
};