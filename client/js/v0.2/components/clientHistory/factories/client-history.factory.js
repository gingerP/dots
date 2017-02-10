define([
    'angular',
    'lodash',
    'business/game.storage',
    'components/clientHistory/clientHistory.module'
], function (angular, _, GameStorage) {
    'use strict';

    angular.module('client.history.module').factory('clientHistoryConfig', clientHistoryConfig);

    function clientHistoryConfig() {
        function prepareHistoryForUi(clientHistory) {
            var myself = GameStorage.getClient();

            _.forEach(clientHistory, function prepareHistoryRecord(historyRecord) {
                if (historyRecord.from._id === myself._id) {
                    historyRecord.myself = historyRecord.from;
                    historyRecord.opponent = historyRecord.to;
                } else {
                    historyRecord.myself = historyRecord.to;
                    historyRecord.opponent = historyRecord.from;
                }
                delete historyRecord.from;
                delete historyRecord.to;
            });

            return clientHistory;
        }

        return {
            prepareHistoryForUi: prepareHistoryForUi
        };
    }
});
