import Stream from 'stream'
import Console from 'console'
import EventEmitter, { EventInterface } from '@rizzzi/eventemitter'

export interface LoggerEvents extends EventInterface {
  error: [error: ErrorLog]
  nonCriticalError: [error: NonCriticalErrorLog]
  warn: [warning: WarningLog]
  info: [info: InfoLog]
}

export enum LogLevel {
  Error,
  NonCriticalError,
  Warn,
  Info
}

export interface BaseLog {
  time: number
  trace: Array<string>
  context?: LoggerContext
  scope: string
}

export interface ErrorLog extends BaseLog {
  level: LogLevel.Error
  error: Error
}

export interface NonCriticalErrorLog extends BaseLog {
  level: LogLevel.NonCriticalError
  error: Error
}

export interface WarningLog extends BaseLog {
  level: LogLevel.Warn
  message: string
}

export interface InfoLog extends BaseLog {
  level: LogLevel.Info
  message: string
}

export type Log =
  | ErrorLog
  | NonCriticalErrorLog
  | WarningLog
  | InfoLog

export interface LoggerOptions {
  context?: LoggerContext,
  streamOut?: Stream.Writable,
  streamErr?: Stream.Writable
}

export interface LoggerContext {
  [key: string]: any
}

export class Logger {
  public constructor ({ context, streamErr, streamOut }: LoggerOptions = {}) {
    this.events = new EventEmitter({ requireErrorHandling: false })

    const { on, once, off } = this.events.bind()
    this.on = on
    this.once = once
    this.off = off

    this.streamOut = streamOut
    this.streamErr = streamErr
    this.context = context
    this.console = new Console.Console(streamOut || process.stdout, streamErr || process.stderr)

    Object.assign(this, {
      info: this.info.bind(this),
      warn: this.warn.bind(this),
      error: this.error.bind(this),
      nonCriticalError: this.nonCriticalError.bind(this)
    })
  }

  public readonly events: EventEmitter<LoggerEvents>
  public readonly streamOut?: Stream.Writable
  public readonly streamErr?: Stream.Writable
  public readonly context?: LoggerContext
  public readonly console: Console

  public readonly on: this['events']['on']
  public readonly once: this['events']['once']
  public readonly off: this['events']['off']

  private _getTrace () {
    const trace: Array<string> = []
    const rawTrace = `${new Error().stack}`.split('\n')
    for (let i = 2; rawTrace.length > i; i++) {
      const traceEntry = rawTrace[i].replace(/^ {4}at /, '').trim()

      if (
        (traceEntry.startsWith('Logger.')) ||
        (traceEntry.startsWith('ScopedLogger.'))
      ) {
        continue
      }

      trace.push(traceEntry)
    }

    return trace
  }

  public info (scope: string, message: string, context?: LoggerContext) {
    return this.events.emit('info', {
      time: Date.now(),
      level: LogLevel.Info,
      scope,
      message,
      trace: this._getTrace(),
      context: { ...this.context, ...context }
    })
  }

  public warn (scope: string, message: string, context?: LoggerContext) {
    return this.events.emit('warn', {
      time: Date.now(),
      level: LogLevel.Warn,
      scope,
      message,
      trace: this._getTrace(),
      context: { ...this.context, ...context }
    })
  }

  public error (scope: string, error: Error, context?: LoggerContext) {
    return this.events.emit('error', {
      time: Date.now(),
      level: LogLevel.Error,
      scope,
      error,
      trace: this._getTrace(),
      context: { ...this.context, ...context }
    })
  }

  public nonCriticalError (scope: string, error: Error, context?: LoggerContext) {
    return this.events.emit('nonCriticalError', {
      time: Date.now(),
      level: LogLevel.NonCriticalError,
      scope,
      error,
      trace: this._getTrace(),
      context: { ...this.context, ...context }
    })
  }

  public bind () {
    const { info: log } = this

    return {
      log: log.bind(this)
    }
  }

  public createScope (scope: string, context?: LoggerContext) {
    return new ScopedLogger(this, scope, context)
  }
}

export class ScopedLogger {
  public constructor (main: Logger, scope: string, context?: LoggerContext) {
    this.main = main
    this.scope = scope
    this.context = context

    Object.assign(this, {
      info: this.info.bind(this),
      warn: this.warn.bind(this),
      error: this.error.bind(this),
      nonCriticalError: this.nonCriticalError.bind(this)
    })
  }

  public readonly main: Logger
  public readonly scope: string
  public readonly context?: LoggerContext

  public info (message: string, context?: LoggerContext) {
    return this.main.info(this.scope, message, { ...this.context, ...context })
  }

  public warn (message: string, context?: LoggerContext) {
    return this.main.warn(this.scope, message, { ...this.context, ...context })
  }

  public error (error: Error, context?: LoggerContext) {
    return this.main.error(this.scope, error, { ...this.context, ...context })
  }

  public nonCriticalError (error: Error, context?: LoggerContext) {
    return this.main.nonCriticalError(this.scope, error, { ...this.context, ...context })
  }

  public createScope (scope: string, context?: LoggerContext) {
    return this.main.createScope(scope, context)
  }
}
