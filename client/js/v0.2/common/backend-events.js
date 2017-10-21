define([],
    /**
     *
     * @typedef {{GAME: {IS_CLOSED: string, STATE: {GET: string}, STEP: {NEW: string}, CANCEL: {GAVE_UP: string,
     * OFFER_DRAW: string, OFFER_COMPLETE: string}}, INVITE: {INVITE: string, REJECT: string, REJECT_TO_LATE: string,
     * SUCCESS: string, SUCCESS_TO_LATE: string}, CLIENT: {LIST: {GET: string}, MYSELF: {GET: string}, NEW: string,
     * RECONNECT: string, DISCONNECT: string, STATUS: {CHANGE: string}, HISTORY: {GET: string}}, CONNECTION:
     * {NEW: string}, EVENTS: {LIST: {GET: string}}, DOT: {ADD: string}}} BackendEvents
     * @returns {{BackendEvents}} backend api endpoints
     */
    function () {
        return {
            GAME: {
                IS_CLOSED: 'game/is_closed',
                STATE: {
                    GET: 'game/state/get'
                },
                STEP: {
                    NEW: 'game/step/new'
                },
                CANCEL: {
                    GAVE_UP: 'game/gave_up',
                    OFFER_DRAW: 'game/offer_draw',
                    OFFER_COMPLETE: 'game/offer_complete'
                }
            },
            INVITE: {
                INVITE: 'invite',
                REJECT: 'invite/reject',
                REJECT_TO_LATE: 'invite/reject_to_late',
                SUCCESS: 'invite/success',
                SUCCESS_TO_LATE: 'invite/success_to_late'
            },
            CLIENT: {
                LIST: {
                    GET: 'client/list/get'
                },
                MYSELF: {
                    GET: 'client/myself/get'
                },
                NEW: 'client/new',
                RECONNECT: 'client/reconnect',
                DISCONNECT: 'client/disconnect',
                STATUS: {
                    CHANGE: 'client/status/change'
                },
                HISTORY: {
                    GET: 'client/history/get'
                }
            },
            CONNECTION: {
                NEW: 'connnection/new'
            },
            EVENTS: {
                LIST: {
                    GET: 'events/list/get'
                }
            },
            DOT: {
                ADD: 'dot/add'
            }
        };
    });
