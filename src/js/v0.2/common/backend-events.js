define([], function () {
    return {
        GENERAL: {
            CLIENT_DISCONNECT: 'client_disconnect',
            CLIENT_RECONNECT: 'client_reconnect',
            NEW_CLIENT: 'new_client'
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
            GET_CLIENTS_LIST: 'get_clients_list'
        }
    };
});
