/// <reference types="node" />
/// <reference types="node" />
import Stream from 'stream';
import EventEmitter, { EventInterface } from '@rizzzi/eventemitter';
export interface LoggerEvents extends EventInterface {
    error: [error: ErrorLog];
    nonCriticalError: [error: NonCriticalErrorLog];
    warn: [warning: WarningLog];
    info: [info: InfoLog];
}
export declare enum LogLevel {
    Error = 0,
    NonCriticalError = 1,
    Warn = 2,
    Info = 3
}
export interface BaseLog {
    time: number;
    trace: Array<string>;
    context?: LoggerContext;
    scope: string;
}
export interface ErrorLog extends BaseLog {
    level: LogLevel.Error;
    error: Error;
}
export interface NonCriticalErrorLog extends BaseLog {
    level: LogLevel.NonCriticalError;
    error: Error;
}
export interface WarningLog extends BaseLog {
    level: LogLevel.Warn;
    message: string;
}
export interface InfoLog extends BaseLog {
    level: LogLevel.Info;
    message: string;
}
export type Log = ErrorLog | NonCriticalErrorLog | WarningLog | InfoLog;
export interface LoggerOptions {
    context?: LoggerContext;
    streamOut?: Stream.Writable;
    streamErr?: Stream.Writable;
}
export interface LoggerContext {
    [key: string]: any;
}
export declare class Logger {
    constructor({ context, streamErr, streamOut }?: LoggerOptions);
    readonly events: EventEmitter<LoggerEvents>;
    readonly streamOut?: Stream.Writable;
    readonly streamErr?: Stream.Writable;
    readonly context?: LoggerContext;
    readonly console: Console;
    readonly on: this['events']['on'];
    readonly once: this['events']['once'];
    readonly off: this['events']['off'];
    private _getTrace;
    info(scope: string, message: string, context?: LoggerContext): Promise<boolean>;
    warn(scope: string, message: string, context?: LoggerContext): Promise<boolean>;
    error(scope: string, error: Error, context?: LoggerContext): Promise<boolean>;
    nonCriticalError(scope: string, error: Error, context?: LoggerContext): Promise<boolean>;
    bind(): {
        log: (scope: string, message: string, context?: LoggerContext | undefined) => Promise<boolean>;
    };
    createScope(scope: string, context?: LoggerContext): ScopedLogger;
}
export declare class ScopedLogger {
    constructor(main: Logger, scope: string, context?: LoggerContext);
    readonly main: Logger;
    readonly scope: string;
    readonly context?: LoggerContext;
    info(message: string, context?: LoggerContext): Promise<boolean>;
    warn(message: string, context?: LoggerContext): Promise<boolean>;
    error(error: Error, context?: LoggerContext): Promise<boolean>;
    nonCriticalError(error: Error, context?: LoggerContext): Promise<boolean>;
    createScope(scope: string, context?: LoggerContext): ScopedLogger;
}
