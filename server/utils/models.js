'use strict';
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const Vertex = Joi.object().keys({
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required(),
});

module.exports = {
    game_data: Joi.object().keys({
        _id: Joi.objectId().required(),
        game: Joi.objectId().required(),
        client: Joi.objectId().required(),
        //only not captured dots
        dots: Joi.array().items(Vertex),
        // only loops with captured opponent dots
        loops: Joi.array().items(Vertex),
        //only lost dots
        losingDots: Joi.array().items(Vertex),
        color: Joi.string().required()
    }),
    game_data_cache: Joi.object().keys({
        _id: Joi.objectId().required(),
        gameDataId: Joi.objectId().required(),
		dotsNotCapturedOpponentDots: Joi.array().items(Vertex),
        dotsOutsideLoops: Joi.array().items(Vertex),
        cache: Joi.array().items(Joi.object().keys({
            loop: Joi.array().items(Vertex),
            passed: Joi.number().integer().required(),
            //only the opponent's captured dots
            capturedDots: Joi.array().items(Vertex),
            //all dots inside the loop, not only the opponent's dots
            trappedDots: Joi.array().items(Vertex)
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
        loop: Joi.array().items(Vertex),
        passed: Joi.number().integer().required(),
        trappedDots: Joi.array().items(Vertex)
    }))
};