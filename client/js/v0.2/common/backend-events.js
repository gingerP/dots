define([], function () {
    return {
/*
        GENERAL: {
            CLIENT_DISCONNECT: 'client_disconnect',
            CLIENT_RECONNECT: 'client_reconnect',
            NEW_CLIENT: 'new_client',
            CLIENT_NETWORK_STATUS_CHANGED: 'clients_status_change'
        },
        INVITE: {
            ASK: 'invite_player',
            REJECT: 'reject_invite_player',
            REJECT_TO_LATE: 'reject_invite_player_to_late',
            SUCCESS: 'success_invite_player',
            SUCCESS_TO_LATE: 'success_invite_player_to_late',
            CANCEL_GAME: 'cancel_game'
        },
        GAME: {
            ADD_DOT: 'add_dot',
            GAME_STEP: 'game_step'
        },
        DATA: {
            GET_GAME_STATE: 'get_game_state',
            IS_GAME_CLOSED: 'is_game_closed',
            GET_CLIENTS_LIST: 'get_clients_list',
            CLIENT_HISTORY: 'client_history/list'
        },
*/


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
