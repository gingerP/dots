const sysUtil = require('util');
var log = _req('src/js/logger');
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
var iconvLiteExtendNodeEncondins = false;

function getRef(ref) {
    if (typeof(dependencies[ref]) == "string") {
        try {
            dependencies[ref] = require(dependencies[ref]);
        } catch(e) {
            logger.gr.info(e.message);
        }
    }
    return dependencies[ref];
}

var api = {
    loadDom: function (url, callback, encodeFrom) {
        if (typeof(url) === 'string' && (url.indexOf('http://') != 0 && url.indexOf('https://') != 0)) {
            url = 'http://' + url;
        }
        console.time('load');
        if (!iconvLiteExtendNodeEncondins) {
            getRef('iconvLite').extendNodeEncodings();
            iconvLiteExtendNodeEncondins = true;
        }
        logger.ld.info('Download: ' + url);
        getRef('request').defaults({pool: {maxSockets: Infinity}, timeout: 100 * 1000})({
            url: url,
            encoding: encodeFrom,
            headers: {
                "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36",
                "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        }, function (error, response, body) {
            console.timeEnd('load');
            logger.ld.info('Html body size: ' + api.getStringByteSize(body));
            var res = null;
            //var translator = new (getRef('iconv'))(encodeFrom, 'utf8');
            if (!error && response.statusCode == 200) {
                res = body;
                if (typeof(callback) == 'function') {
                    //  callback(translator.convert(res).toString());
                    callback(error, res);
                }
            } else {
                logger.ld.warn("Could NOT CONNECT to " + url);
                callback(error);
            }
        });
    },
    parseHtml: function(string) {
        var htmlParser = getRef('cheerio');
        return htmlParser.load(string);
    },
    extractDataFromHtml: function (dom, cfg, callback) {
        var Parser = getRef('htmlToJson');
        if (typeof(callback) == 'function') {
            setTimeout(function() {
                var parser = new Parser();
                try {
                    callback(null, parser.get(dom, cfg));
                } catch(error) {
                    callback(error);
                }
            }, 0)
        } else {
            return new Parser().get(dom, cfg);
        }
    },
    _extractDataFromHtml: function(dom, cfg, mainSelector, childrenKey) {
        var doc = this.parseHtml(dom);
        var html = doc(mainSelector, dom);
        var result = {};
        if (html.length) {
            iterateDom(html[0], result, cfg.levelConfig);
        }
        return result;
    },
    _private: {
        _parseExtract: function(dom, level) {
            var objects = doc(level.down, dom);
            var res = [];
            for(var index = 0; index < objects.length; index++) {
                res.push(this._parseHandleData(objects[index], level.data));
            }
            return {
                DOMList: objects || [],
                itemList: res
            };
        },
        _parseIterateDom: function (dom, data, levelCfg) {
            var pack = this._parseExtract(dom, levelCfg.node);
            var cfgList = levelCfg.children;
            var ddom = null;
            var ddata = null;
            if (cfgList && cfgList.length && pack.DOMList.length) {
                for (var childIndex = 0; childIndex < pack.DOMList.length; childIndex++) {
                    for(var cfgIndex = 0; cfgIndex < cfgList.length; cfgIndex++) {
                        ddom = pack.DOMList[childIndex];
                        ddata = pack.itemList[childIndex];
                        iterateDom(ddom, ddata, cfgList[cfgIndex]);
                    }
                }
            }
            data[childrenKey] = pack.itemList;
        },
        _parseHandleData: function (dom, dataCfg) {
            var result = {};
            var cfg = null;
            var name = null;
            var children = null;
            for (var cfgIndex = 0; cfgIndex < dataCfg.length; cfgIndex++) {
                cfg = dataCfg[cfgIndex];
                children = doc(cfg.selector, dom);
                result[cfg.name] = cfg.handler(children, cfg, doc);
            }
            return result;
        }
    },
    hasContent: function(obj) {
        if (typeof(obj) == 'string') {
            return obj != null && obj != '';
        } else if (obj != null && this.isArray(obj)) {
            return obj.length > 0;
        } else if (typeof(obj) != 'undefined') {
            return obj != null && !!Object.keys(obj).length;
        }
        return false;
    },
    isArray: function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    cleanStr: function(str) {
        return typeof(str) === 'string' && this.hasContent(str)? str.trim(): '';
    },
    linkRequestsToModule: function(routes, module, router, type) {
        routes.forEach(function(rout) {
            router[type? type: 'get'](rout.path, (function() {
                var rt = rout;
                return function(req, res) {
                    try {
                        if (rt.async) {
                            module[rt.method](req, res, function (data) {
                                if (data instanceof Error) {
                                    res.send(api.wrapResponse(null, data, res));
                                } else {
                                    res.send(api.wrapResponse(data, null, res));
                                }
                            })
                        } else {
                            res.send(api.wrapResponse(module[rt.method](req, res)));
                        }
                    } catch(e) {
                        res.send(api.wrapResponse(null, e, res));
                    }
                }
            })());
            logger.lrtm.info('Request "%s" mapped.', rout.path);
        });
    },
    wrapResponse: function(data, error, response) {
        var reqPath = null;
        if (error) {
            reqPath  = response.req.originalUrl;
            logger.wr.error('ERROR REQUEST ' + reqPath + ': ' + error);
            return {
                onError: error.message
            }
        } else {
            return {
                onSuccess: data
            }
        }
    },
    getCfg: function(configName) {
        return require('./dataConfigs/' + configName);
    },
    getValueFromObjectByPath: function(obj, path) {
        var key;
        var tmp = obj;
        var keys;
        if (obj && typeof(obj) == 'object' && !Array.isArray(obj)) {
            keys = path.split('.');
            for (var index = 0; index < keys.length; index++) {
                key = keys[index];
                tmp = tmp[key];
                if (typeof(tmp) == 'undefined') {
                    tmp = null;
                    break;
                }
            }
        }
        return tmp;
    },
    setValueToObjectByPath: function(dest, path, value) {
        var keys = path.split('.');
        var key;
        dest = dest || {};
        for (var index = 0; index < keys.length; index++) {
            key = keys[index];
            if (index == keys.length - 1) {
                dest[key] = value;
            } else {
                dest[key] = dest[key] || {};
                dest = dest[key];
            }
        }
    },
    extractFields: function(object, mappings) {
        var result = {};
        var value;
        var mapping;
        for(var index = 0; index < mappings.length; index++) {
            mapping = mappings[index];
            value = api.getValueFromObjectByPath(object, mapping.property);
            api.setValueToObjectByPath(result, mapping.input, value);
        }
        return result;
    },
    isObject: function(obj) {
        return typeof(obj) === 'object' &&  obj !== null;
    },
    inherit: function() {

    },
    getMappingsItemByProperty: function(mappings, property) {
        var result;
        var index;
        if (mappings && mappings.length) {
            index = mappings.length - 1;
            while(index > -1) {
                if (mappings[index].property === property) {
                    result = mappings[index];
                    index = -1;
                }
            }
        }
        return result;
    },
    eval: function(script, sandbox) {
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
    getRandomString: function() {
        return Math.random().toString(36).substring(7);
    },
    getStringByteSize: function(string, params) {
        var fileSizeInBytes = 0;
        params = params || {};
        if (string) {
            var i = -1;
            var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
            fileSizeInBytes = Buffer.byteLength(string, params.encod || 'koi8r');
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes > 1024);

            return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
        }
        return "0 bytes";
    },
    merge: function(arg1, arg2) {
        return getRef('extend')(true, arg1, arg2);
    },
    runGc: function(interval) {
        if (typeof(global.gc) == 'function') {
            logger.gc.info('START gc scheduler with %s interval', interval || 10 * 1000);
            return setInterval(function() {
                logger.gc.info('┌ RUN GC!---------------------------------------------------');
                logger.gc.info('| BEFORE GC RUN: %s', sysUtil.inspect(process.memoryUsage()));
                global.gc();
                logger.gc.info('| AFTER  GC RUN: %s', sysUtil.inspect(process.memoryUsage()));
                logger.gc.info('└ FINISH GC!------------------------------------------------');
            }, interval || 10 * 1000);
        } else {
            logger.gc.warn('gc is not defined!');
        }
    }
};

module.exports = api;