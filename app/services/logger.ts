import { analytics } from './analytics';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
}

class Logger {
  private static instance: Logger;
  private readonly MAX_LOGS = 1000;
  private logs: LogEntry[] = [];
  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private constructor() {
    // Start periodic cleanup
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public debug(message: string, context?: Record<string, any>, userId?: string): void {
    this.log('debug', message, context, userId);
  }

  public info(message: string, context?: Record<string, any>, userId?: string): void {
    this.log('info', message, context, userId);
  }

  public warn(message: string, context?: Record<string, any>, userId?: string): void {
    this.log('warn', message, context, userId);
  }

  public error(message: string, error?: Error, context?: Record<string, any>, userId?: string): void {
    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    this.log('error', message, errorContext, userId);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
    };

    this.logs.push(entry);
    this.cleanup();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(entry);
    }

    // Track errors in analytics
    if (level === 'error') {
      analytics.trackError(new Error(message), userId, context);
    }
  }

  private consoleLog(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry;
    const color = this.getLogColor(level);
    const prefix = `[${timestamp}] ${level.toUpperCase()}: `;
    
    console.log(
      `%c${prefix}%c${message}`,
      `color: ${color}`,
      'color: inherit',
      context || ''
    );
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '#808080';
      case 'info':
        return '#0000FF';
      case 'warn':
        return '#FFA500';
      case 'error':
        return '#FF0000';
      default:
        return '#000000';
    }
  }

  private cleanup(): void {
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }
  }

  // Log retrieval methods
  public getLogs(level?: LogLevel, userId?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (userId && log.userId !== userId) return false;
      return true;
    });
  }

  public getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count);
  }

  public getLogsByTimeRange(startTime: Date, endTime: Date): LogEntry[] {
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  }

  // Log analysis methods
  public getErrorCount(userId?: string): number {
    return this.getLogs('error', userId).length;
  }

  public getWarningCount(userId?: string): number {
    return this.getLogs('warn', userId).length;
  }

  public getInfoCount(userId?: string): number {
    return this.getLogs('info', userId).length;
  }

  public getDebugCount(userId?: string): number {
    return this.getLogs('debug', userId).length;
  }

  // Log export methods
  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    return JSON.stringify(this.logs, null, 2);
  }

  private exportToCSV(): string {
    const headers = ['timestamp', 'level', 'message', 'userId', 'context'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.level,
      log.message,
      log.userId || '',
      JSON.stringify(log.context || {}),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
  }

  // Log filtering methods
  public filterLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public filterLogsByUser(userId: string): LogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  public filterLogsByMessage(message: string): LogEntry[] {
    return this.logs.filter(log => log.message.includes(message));
  }

  // Log statistics
  public getLogStats(): Record<LogLevel, number> {
    return {
      debug: this.getDebugCount(),
      info: this.getInfoCount(),
      warn: this.getWarningCount(),
      error: this.getErrorCount(),
    };
  }

  // Log clearing methods
  public clearLogs(): void {
    this.logs = [];
  }

  public clearLogsByLevel(level: LogLevel): void {
    this.logs = this.logs.filter(log => log.level !== level);
  }

  public clearLogsByUser(userId: string): void {
    this.logs = this.logs.filter(log => log.userId !== userId);
  }
}

export const logger = Logger.getInstance(); 