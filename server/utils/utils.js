const sysUtil = require('util');
var log = require('server/logging/logger');
var logger = {
    gc: log.create('runGc'),
    gr: log.create('getRef'),
    ld: log.create('utils.loadDom'),
    lrtm: log.create('utils.linkRequestsToModule'),
    wr: log.create('utils.wrapResponse'),
    e: log.create('utils.eval')
};
var dependencies = {
    extend: "extend",
    request: 'request',
    cheerio: 'cheerio',
    iconv: 'iconv',
    express: 'express',
    iconvLite: 'iconv-lite',
    htmlToJson: './modules/HtmlToJson',
    vm: 'vm'
};
var api;
var iconvLiteExtendNodeEncondins = false;

function getRef(ref) {
    if (typeof(dependencies[ref]) === "string") {
        try {
            dependencies[ref] = require(dependencies[ref]);
        } catch (e) {
            logger.gr.info(e.message);
        }
    }
    return dependencies[ref];
}

api = {
    loadDom: function (url, callback, encodeFrom) {
        var preparedUrl = url;
        if (typeof(preparedUrl) === 'string' && (preparedUrl.indexOf('http://') !== 0
            && url.indexOf('https://') !== 0)) {
            preparedUrl = 'http://' + url;
        }
        console.time('load');
        if (!iconvLiteExtendNodeEncondins) {
            getRef('iconvLite').extendNodeEncodings();
            iconvLiteExtendNodeEncondins = true;
        }
        logger.ld.info('Download: ' + preparedUrl);
        getRef('request').defaults({pool: {maxSockets: Infinity}, timeout: 100 * 1000})({
            url: preparedUrl,
            encoding: encodeFrom,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/48.0.2564.97 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        }, function (error, response, body) {
            var res;
            console.timeEnd('load');
            logger.ld.info('Html body size: ' + api.getStringByteSize(body));
            //var translator = new (getRef('iconv'))(encodeFrom, 'utf8');
            if (!error && response.statusCode === 200) {
                res = body;
                if (typeof(callback) === 'function') {
                    //  callback(translator.convert(res).toString());
                    callback(error, res);
                }
            } else {
                logger.ld.warn('Could NOT CONNECT to ' + url);
                callback(error);
            }
        });
    },
    parseHtml: function (string) {
        var htmlParser = getRef('cheerio');
        return htmlParser.load(string);
    },
    extractDataFromHtml: function (dom, cfg, callback) {
        var Parser = getRef('htmlToJson');
        if (typeof(callback) === 'function') {
            setTimeout(function () {
                var parser = new Parser();
                try {
                    callback(null, parser.get(dom, cfg));
                } catch (error) {
                    callback(error);
                }
            }, 0);
            return null;
        }
        return new Parser().get(dom, cfg);
    },
    hasContent: function (obj) {
        if (typeof(obj) === 'string') {
            return obj !== null && obj !== '';
        } else if (obj !== null && this.isArray(obj)) {
            return obj.length > 0;
        } else if (typeof(obj) !== 'undefined') {
            return obj !== null && !!Object.keys(obj).length;
        }
        return false;
    },
    isArray: function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    cleanStr: function (str) {
        return typeof(str) === 'string' && this.hasContent(str) ? str.trim() : '';
    },
    linkRequestsToModule: function (routes, module, router, type) {
        routes.forEach(function (rout) {
            router[type ? type : 'get'](rout.path, (function () { //eslint-disable-line
                var rt = rout;
                return function (req, res) {
                    try {
                        if (rt.async) {
                            module[rt.method](req, res, function (data) {
                                if (data instanceof Error) {
                                    res.send(api.wrapResponse(null, data, res));
                                } else {
                                    res.send(api.wrapResponse(data, null, res));
                                }
                            });
                        } else {
                            res.send(api.wrapResponse(module[rt.method](req, res)));
                        }
                    } catch (e) {
                        res.send(api.wrapResponse(null, e, res));
                    }
                };
            })());
            logger.lrtm.info('Request "%s" mapped.', rout.path);
        });
    },
    wrapResponse: function (data, error, response) {
        var reqPath = null;
        if (error) {
            reqPath = response.req.originalUrl;
            logger.wr.error('ERROR REQUEST ' + reqPath + ': ' + error);
            return {
                onError: error.message
            };
        }
        return {
            onSuccess: data
        };
    },
    getCfg: function (configName) {
        return require('./dataConfigs/' + configName);
    },
    getValueFromObjectByPath: function (obj, path) {
        var key;
        var tmp = obj;
        var keys;
        var index = 0;
        if (obj && typeof(obj) === 'object' && !Array.isArray(obj)) {
            keys = path.split('.');
            for (; index < keys.length; index++) {
                key = keys[index];
                tmp = tmp[key];
                if (typeof(tmp) === 'undefined') {
                    tmp = null;
                    break;
                }
            }
        }
        return tmp;
    },
    setValueToObjectByPath: function (dest, path, value) {
        var keys = path.split('.');
        var key;
        var index = 0;
        var preparedDest = dest || {};
        for (; index < keys.length; index++) {
            key = keys[index];
            if (index === keys.length - 1) {
                preparedDest[key] = value;
            } else {
                preparedDest[key] = preparedDest[key] || {};
                preparedDest = preparedDest[key];
            }
        }
    },
    extractFields: function (object, mappings) {
        var result = {};
        var value;
        var mapping;
        var index = 0
        for (; index < mappings.length; index++) {
            mapping = mappings[index];
            value = api.getValueFromObjectByPath(object, mapping.property);
            api.setValueToObjectByPath(result, mapping.input, value);
        }
        return result;
    },
    isObject: function (obj) {
        return typeof(obj) === 'object' && obj !== null;
    },
    inherit: function () {

    },
    getMappingsItemByProperty: function (mappings, property) {
        var result;
        var index;
        if (mappings && mappings.length) {
            index = mappings.length - 1;
            while (index > -1) {
                if (mappings[index].property === property) {
                    result = mappings[index];
                    index = -1;
                }
            }
        }
        return result;
    },
    eval: function (script, sandbox) {
        var vm = getRef('vm');
        var context = new vm.createContext(sandbox);
        var compiledHandler = new vm.Script(script);
        try {
            compiledHandler.runInContext(context);
        } catch (e) {
            logger.e.warn(e);
            context.ERROR_EVAL = e.message;
        }
        compiledHandler = null;
        return context;
    },
    getRandomString: function () {
        return Math.random().toString(36).substring(7);
    },
    getStringByteSize: function (string, params) {
        var fileSizeInBytes = 0;
        var i = -1;
        var byteUnits;
        var preparedParams = params || {};
        if (string) {
            byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
            fileSizeInBytes = Buffer.byteLength(string, preparedParams.encod || 'koi8r');
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        }
        return '0 bytes';
    },
    merge: function (arg1, arg2) {
        return getRef('extend')(true, arg1, arg2);
    },
    runGc: function (interval) {
        if (typeof(global.gc) === 'function') {
            logger.gc.info('START gc scheduler with %s interval', interval || 10 * 1000);
            return setInterval(function () {
                logger.gc.info('┌ RUN GC!---------------------------------------------------');
                logger.gc.info('| BEFORE GC RUN: %s', sysUtil.inspect(process.memoryUsage()));
                global.gc();
                logger.gc.info('| AFTER  GC RUN: %s', sysUtil.inspect(process.memoryUsage()));
                logger.gc.info('└ FINISH GC!------------------------------------------------');
            }, interval || 10 * 1000);
        }
        logger.gc.warn('gc is not defined!');
        return null;
    }
};

module.exports = api;