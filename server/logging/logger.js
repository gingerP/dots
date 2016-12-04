var dateFormat = require('dateformat');
var log4js = require('log4js');
var logger;
var mainScriptName = __filename.split(__dirname)[1].substr(1);
const DEFAULT_LEVEL = 'DEBUG';
log4js.configure('./config/log-properties.json');
log4js.addAppender(log4js.appenders.file('./logs/' + mainScriptName + '_' + dateFormat('yyyyddHHMM') + '.log'));
logger = log4js.getLogger();
logger.setLevel(DEFAULT_LEVEL);
module.exports = {
	instance: logger,
	level: function(level) {
		logger.setLevel(level || DEFAULT_LEVEL);
		return logger;
	},
	create: function(category, level) {
		var loggerInstance = log4js.getLogger(category || '');
		loggerInstance.setLevel(level || DEFAULT_LEVEL);
		return loggerInstance;
	}
};