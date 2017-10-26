define(function () {
    'use strict';

    return {
        AUTH: {
            SOCIAL: {
                GOOGLE: '/auth/google',
                VK: '/auth/vk',
                FACEBOOK: '/auth/facebook'
            },
            LOGOUT: '/logout'
        },
        PLAYER: {
            DEFAULT_RATING: 1000,
            COLORS: {
                red: '#F44336',
                blue: '#2196F3'
            }
        },
        GAME_MODE: {
            LOCAL: 'LOCAL',
            NETWORK: 'NETWORK'
        },
        TABS: {
            ACTIVE_GAME: 'activeGame',
            GAMERS: 'gamers',
            SIGNIN: 'signin',
            CLIENT_HISTORY: 'clientHistory'
        },
        GAME: {
            CANCEL: {
                GAVE_UP: 'gave_up',
                DRAW: 'draw',
                COMPLETE: 'complete'
            }
        },
        API: {
            GAME: {
                IS_CLOSED: 'game/is_closed',
                STATE: {
                    GET: 'game/state/get'
                },
                STEP: {
                    NEW: 'game/step/new'
                },
                CANCEL: 'game/cancel'
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
        }
    };
});
