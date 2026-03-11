import { LoggerService, Injectable, Optional, Inject } from '@nestjs/common';
import chalk from 'chalk';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

interface StructuredLog {
  level: string;
  timestamp: string;
  context?: string;
  message: any;
  trace?: string;
  [key: string]: any;
}

@Injectable()
export class AppLogger implements LoggerService {
  private context?: string;
  private readonly isProduction: boolean;

  constructor(@Optional() @Inject('LOG_CONTEXT') context?: string) {
    this.context = context;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: any, ...optionalParams: any[]): void {
    this.printMessage('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.printMessage('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.printMessage('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.printMessage('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.printMessage('verbose', message, optionalParams);
  }

  /** Custom method — success level (maps to 'log' in prod) */
  success(message: any): void {
    if (this.isProduction) {
      this.printJson({ level: 'log', timestamp: new Date().toISOString(), context: this.context, message });
    } else {
      console.log(chalk.green(this.formatDev('SUCCESS', message)));
    }
  }

  /** Custom method — danger level (maps to 'error' in prod) */
  danger(message: any): void {
    if (this.isProduction) {
      this.printJson({ level: 'error', timestamp: new Date().toISOString(), context: this.context, message });
    } else {
      console.log(chalk.red(this.formatDev('DANGER', message)));
    }
  }

  // ─── Structured log helper for interceptor/filter use ────────────────
  /** Emit a fully structured log entry (JSON in prod, formatted in dev) */
  structured(level: LogLevel, data: Record<string, any>): void {
    const timestamp = new Date().toISOString();

    if (this.isProduction) {
      this.printJson({ level, timestamp, ...data });
    } else {
      const { context, message, ...rest } = data;
      const meta = Object.keys(rest).length > 0 ? ` | ${JSON.stringify(rest)}` : '';
      const ctx = context ?? this.context ?? '';
      const tag = level.toUpperCase();
      const colorFn = this.getColor(level);
      console.log(colorFn(`[${timestamp}] [${tag}] [${ctx}] ${message ?? ''}${meta}`));
    }
  }

  // ─── Internal helpers ────────────────────────────────────────────────

  private printMessage(level: LogLevel, message: any, optionalParams: any[]): void {
    const timestamp = new Date().toISOString();

    // NestJS passes context as last string argument
    const contextArg = optionalParams.length > 0 && typeof optionalParams[optionalParams.length - 1] === 'string'
      ? optionalParams[optionalParams.length - 1]
      : undefined;

    const context = contextArg ?? this.context;

    // For error level, NestJS may pass stack trace as second param
    const trace = level === 'error' && optionalParams.length > 0 && typeof optionalParams[0] === 'string' && optionalParams[0] !== contextArg
      ? optionalParams[0]
      : undefined;

    if (this.isProduction) {
      const entry: StructuredLog = { level, timestamp, context, message };
      if (trace) entry.trace = trace;
      this.printJson(entry);
    } else {
      const tag = level.toUpperCase();
      const colorFn = this.getColor(level);
      const ctxStr = context ? ` [${context}]` : '';
      console.log(colorFn(`[${timestamp}] [${tag}]${ctxStr} ${message}`));
      if (trace) {
        console.log(chalk.gray(trace));
      }
    }
  }

  private printJson(entry: Record<string, any>): void {
    const output = JSON.stringify(entry);
    if (entry.level === 'error') {
      console.error(output);
    } else if (entry.level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  private formatDev(tag: string, message: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${tag}] ${message}`;
  }

  private getColor(level: LogLevel): (text: string) => string {
    switch (level) {
      case 'error': return chalk.red.bold;
      case 'warn': return chalk.yellow;
      case 'debug': return chalk.magenta;
      case 'verbose': return chalk.cyan;
      case 'log':
      default: return chalk.blue;
    }
  }
}
