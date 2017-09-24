'use strict';
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {
    game_data: Joi.object().keys({
        _id: Joi.objectId().required(),
        game: Joi.objectId().required(),
        client: Joi.objectId().required(),
        dots: Joi.array().items(Joi.object().keys({ //only not captured dots
            x: Joi.number().integer().required(),
            y: Joi.number().integer().required(),
        })),
        loops: [],
        losingDots: Joi.array().items(Joi.object().keys({//only lost dots
            x: Joi.number().integer().required(),
            y: Joi.number().integer().required(),
        })),
        color: Joi.string().required()
    }),
    game_data_cache: Joi.object().keys({
        _id: Joi.objectId().required(),
        gameDataId: Joi.objectId().required(),
        cache: Joi.array().items(Joi.object().keys({
            loop: Joi.array().items(Joi.object().keys({
                x: Joi.number().integer().required(),
                y: Joi.number().integer().required(),
            })),
            passed: Joi.number().integer().required(),
            capturedDots: Joi.array().items(Joi.object().keys({ //only the opponent's captured dots
                x: Joi.number().integer().required(),
                y: Joi.number().integer().required(),
            })),
            trappedDots: Joi.array().items(Joi.object().keys({ //all dots inside the loop, not only the opponent's dots
                x: Joi.number().integer().required(),
                y: Joi.number().integer().required(),
            }))
        }))
    }),
    game: Joi.object().keys({
        _id: Joi.objectId().required(),
        from: Joi.objectId().required(),
        to: Joi.objectId().required(),
        activePlayer: Joi.objectId().required(),
        status: Joi.any().valid(['active', 'closed', 'finished']),
        timestamp: Joi.date().timestamp().required()
    }),
    create_game: Joi.object().keys({
        _id: Joi.objectId().required(),
        from: Joi.objectId().required(),
        to: Joi.objectId().required(),
        status: Joi.any().valid(['active', 'denied', 'successful']),
        timestamp: Joi.date().timestamp().required()
    }),
    client: Joi.object().keys({
        _id: Joi.objectId().required(),
        created: Joi.date().timestamp().required(),
        updated: Joi.date().timestamp().required(),
        isOnline: Joi.boolean(),
        name: Joi.string().required()
    }),
    loops_from_graph: Joi.array().items(Joi.object().keys({
        loop: Joi.array().items(Joi.object().keys({
            x: Joi.number().integer().required(),
            y: Joi.number().integer().required(),
        })),
        passed: Joi.number().integer().required(),
        trappedDots: Joi.array().items(Joi.object().keys({
            x: Joi.number().integer().required(),
            y: Joi.number().integer().required(),
        }))
    }))

};