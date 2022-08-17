"use strict";
exports.__esModule = true;
exports.ScopedLogger = exports.Logger = exports.LogLevel = void 0;
var tslib_1 = require("tslib");
var console_1 = tslib_1.__importDefault(require("console"));
var eventemitter_1 = tslib_1.__importDefault(require("@rizzzi/eventemitter"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Error"] = 0] = "Error";
    LogLevel[LogLevel["NonCriticalError"] = 1] = "NonCriticalError";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Info"] = 3] = "Info";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Logger = /** @class */ (function () {
    function Logger(_a) {
        var _b = _a === void 0 ? {} : _a, context = _b.context, streamErr = _b.streamErr, streamOut = _b.streamOut;
        this.events = new eventemitter_1["default"]({ requireErrorHandling: false });
        var _c = this.events.bind(), on = _c.on, once = _c.once, off = _c.off;
        this.on = on;
        this.once = once;
        this.off = off;
        this.streamOut = streamOut;
        this.streamErr = streamErr;
        this.context = context;
        this.console = new console_1["default"].Console(streamOut || process.stdout, streamErr || process.stderr);
        Object.assign(this, {
            info: this.info.bind(this),
            warn: this.warn.bind(this),
            error: this.error.bind(this),
            nonCriticalError: this.nonCriticalError.bind(this)
        });
    }
    Logger.prototype._getTrace = function () {
        var trace = [];
        var rawTrace = "".concat(new Error().stack).split('\n');
        for (var i = 2; rawTrace.length > i; i++) {
            var traceEntry = rawTrace[i].replace(/^ {4}at /, '').trim();
            if ((traceEntry.startsWith('Logger.')) ||
                (traceEntry.startsWith('ScopedLogger.'))) {
                continue;
            }
            trace.push(traceEntry);
        }
        return trace;
    };
    Logger.prototype.info = function (scope, message, context) {
        return this.events.emit('info', {
            time: Date.now(),
            level: LogLevel.Info,
            scope: scope,
            message: message,
            trace: this._getTrace(),
            context: tslib_1.__assign(tslib_1.__assign({}, this.context), context)
        });
    };
    Logger.prototype.warn = function (scope, message, context) {
        return this.events.emit('warn', {
            time: Date.now(),
            level: LogLevel.Warn,
            scope: scope,
            message: message,
            trace: this._getTrace(),
            context: tslib_1.__assign(tslib_1.__assign({}, this.context), context)
        });
    };
    Logger.prototype.error = function (scope, error, context) {
        return this.events.emit('error', {
            time: Date.now(),
            level: LogLevel.Error,
            scope: scope,
            error: error,
            trace: this._getTrace(),
            context: tslib_1.__assign(tslib_1.__assign({}, this.context), context)
        });
    };
    Logger.prototype.nonCriticalError = function (scope, error, context) {
        return this.events.emit('nonCriticalError', {
            time: Date.now(),
            level: LogLevel.NonCriticalError,
            scope: scope,
            error: error,
            trace: this._getTrace(),
            context: tslib_1.__assign(tslib_1.__assign({}, this.context), context)
        });
    };
    Logger.prototype.bind = function () {
        var log = this.info;
        return {
            log: log.bind(this)
        };
    };
    Logger.prototype.createScope = function (scope, context) {
        return new ScopedLogger(this, scope, context);
    };
    return Logger;
}());
exports.Logger = Logger;
var ScopedLogger = /** @class */ (function () {
    function ScopedLogger(main, scope, context) {
        this.main = main;
        this.scope = scope;
        this.context = context;
        Object.assign(this, {
            info: this.info.bind(this),
            warn: this.warn.bind(this),
            error: this.error.bind(this),
            nonCriticalError: this.nonCriticalError.bind(this)
        });
    }
    ScopedLogger.prototype.info = function (message, context) {
        return this.main.info(this.scope, message, tslib_1.__assign(tslib_1.__assign({}, this.context), context));
    };
    ScopedLogger.prototype.warn = function (message, context) {
        return this.main.warn(this.scope, message, tslib_1.__assign(tslib_1.__assign({}, this.context), context));
    };
    ScopedLogger.prototype.error = function (error, context) {
        return this.main.error(this.scope, error, tslib_1.__assign(tslib_1.__assign({}, this.context), context));
    };
    ScopedLogger.prototype.nonCriticalError = function (error, context) {
        return this.main.nonCriticalError(this.scope, error, tslib_1.__assign(tslib_1.__assign({}, this.context), context));
    };
    ScopedLogger.prototype.createScope = function (scope, context) {
        return this.main.createScope(scope, context);
    };
    return ScopedLogger;
}());
exports.ScopedLogger = ScopedLogger;
