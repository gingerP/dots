define([
    'jquery',
    'handlebars',
    'i18n'
], function ($, Handlebars, i18n) {
    'use strict';

    var api;
    var TEMPLATE_ID = 'handlebars-user-popup';
    var POPUP_CLASS = 'user-settings-popup';
    var ROOT_ID = 'user-settings-popup-container';
    var DATA = {
        i18n: i18n
    };
    var $dom;
    var $shadow;
    var $root;
    var template = Handlebars.compile(document.getElementById(TEMPLATE_ID).innerHTML);
    var events = {
        close: function (event) {
            api.hide();
        },
        submit: function (event) {
            api.hide();
        }
    };

    function init() {
        /*document.body.innerHTML += template(DATA);
        $root = $('#' + ROOT_ID);
        $dom = $root.find('.' + POPUP_CLASS);
        $shadow = $root.find('.full-screen-shadow');
        initEvents();*/
        return api;
    }

    function initEvents() {
/*        $dom.on('click', 'button[name=submit]', events.submit);
        $dom.on('click', '.close-btn', events.close);*/
    }

    function show() {
        /*if (!$dom) {
            init();
        }
        $dom.removeClass('hidden').addClass('visible');
        $shadow.removeClass('hidden').addClass('visible');
        $root.removeClass('hidden').addClass('visible');
        hide();*/
    }

    function hide() {
/*        if (!$dom) {
            init();
        }
        $dom.removeClass('visible').addClass('hidden');
        $shadow.removeClass('visible').addClass('hidden');
        $root.removeClass('visible').addClass('hidden');*/
    }

    function getData() {

    }

    api = {
        init: init,
        show: show,
        hide: hide,
        getData: getData
    };

    return api;
});