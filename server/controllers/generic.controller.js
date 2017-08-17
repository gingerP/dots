'use strict';

const IOC = require('../constants/ioc.constants');
const Joi = require('joi');
const Errors = require('../errors');

class GenericController {
    setService(service) {
        this.service = service;
    }

    getName() {
        return IOC.CONTROLLER.GENERIC;
    }

    createHandleWithResponse() {

    }

    postConstructor() {
    }

    validate(schema, callback) {
        return function(message) {
            const result = Joi.validate(message.data, schema);
            if (result.error) {
                throw result.error;
            }
            return callback(message);
        }
    }

    validator(schema) {
        return this.validatorRaw(Joi.object().keys(schema));
    }

    validatorRaw(schema) {
        return function(message, endPointName) {
            const result = Joi.validate(
                message.data,
                schema,
                {
                    allowUnknown: false
                }
            );
            if (result.error) {
                throw new Errors.RequestValidationError(`end point "${endPointName}" - ${result.error.message}`);
            }
        }
    }
}

module.exports = {
    class: GenericController
};
