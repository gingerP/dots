var _ = require('lodash');

module.exports = {
    GAME: {
        IS_CLOSED: _.constant('game/is_closed'),
        STATE: {
            GET: _.constant('game/state/get')
        },
        STEP: {
            NEW: _.constant('game/step/new')
        },
        CANCEL: {
            GAVE_UP: _.constant('game/gave_up'),
            OFFER_DRAW: _.constant('game/offer_draw'),
            OFFER_COMPLETE: _.constant('game/offer_complete')
        }
    },
    INVITE: {
        INVITE: _.constant('invite'),
        REJECT: _.constant('invite/reject'),
        REJECT_TO_LATE: _.constant('invite/reject_to_late'),
        SUCCESS: _.constant('invite/success'),
        SUCCESS_TO_LATE: _.constant('invite/success_to_late')
    },
    CLIENT: {
        LIST: {
            GET: _.constant('client/list/get')
        },
        MYSELF: {
            GET: _.constant('client/myself/get')
        },
        NEW: _.constant('client/new'),
        RECONNECT: _.constant('client/reconnect'),
        DISCONNECT: _.constant('client/disconnect'),
        STATUS: {
            CHANGE: _.constant('client/status/change')
        },
        HISTORY: {
            GET: _.constant('client/history/get')
        }
    },
    CONNECTION: {
        NEW: _.constant('connnection/new')
    },
    EVENTS: {
        LIST: {
            GET: _.constant('events/list/get')
        }
    },
    DOT: {
        ADD: _.constant('dot/add')
    }
};
