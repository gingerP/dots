'use strict';

module.exports = {
    GAME_ACTIONS: {
        GAVE_UP: 'gave_up',
        DRAW: 'draw',
        COMPLETE: 'complete',
        ALL: ['gave_up', 'draw', 'complete']
    },
    GAME_STATUSES: {
        ACTIVE: 'active',
        CLOSED: 'closed',
        FINISHED: 'finished'
    }
};
