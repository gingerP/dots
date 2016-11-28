define([
    'lodash',
    'jquery'
], function (_, $) {
    'use strict';

    var api;
    var isMobile = Boolean(navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i));
    var DEVICE_CLASS = isMobile ? 'mobile-device' : 'desktop-device';

    function updateDeviceFlag() {
        $(document.body).addClass(DEVICE_CLASS);
    }

    function getRandomString() {
        return Math.random().toString(36).substring(7);
    }

    function createArray(array) {
        var prepareArray = [];
        if (array) {
            prepareArray = _.isArray(array) ? array : [array];
        }
        return prepareArray;
    }

    function isMobileDevice() {
        return isMobile;
    }

    api = {
        getRandomString: getRandomString,
        createArray: createArray,
        isMobile: isMobileDevice,
        updateDeviceFlag: updateDeviceFlag
    };

    return api;
});
