define([], function () {
    return {
        GAME: {
            IS_CLOSED: 'game/is_closed',
            CANCEL: 'game/cancel',
            STATE: {
                GET: 'game/state/get'
            },
            STEP: {
                NEW: 'game/step/new'
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
