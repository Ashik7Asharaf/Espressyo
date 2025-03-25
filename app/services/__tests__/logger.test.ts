import { logger } from '../logger';

describe('Logger Service', () => {
  beforeEach(() => {
    // Clear logs before each test
    logger.clearLogs();
  });

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      const logs = logger.getLogs('debug');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test debug message');
      expect(logs[0].level).toBe('debug');
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      const logs = logger.getLogs('info');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test info message');
      expect(logs[0].level).toBe('info');
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');
      const logs = logger.getLogs('warn');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test warning message');
      expect(logs[0].level).toBe('warn');
    });

    it('should log error messages with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error);
      const logs = logger.getLogs('error');
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test error message');
      expect(logs[0].level).toBe('error');
      expect(logs[0].context?.error).toBeDefined();
      expect(logs[0].context?.error.message).toBe('Test error');
    });
  });

  describe('Context and User ID', () => {
    it('should include context in logs', () => {
      const context = { key: 'value' };
      logger.info('Test message', context);
      const logs = logger.getLogs('info');
      expect(logs[0].context).toEqual(context);
    });

    it('should include user ID in logs', () => {
      const userId = 'test-user-123';
      logger.info('Test message', undefined, userId);
      const logs = logger.getLogs('info');
      expect(logs[0].userId).toBe(userId);
    });

    it('should filter logs by user ID', () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      logger.info('Message 1', undefined, userId1);
      logger.info('Message 2', undefined, userId2);
      const userLogs = logger.filterLogsByUser(userId1);
      expect(userLogs).toHaveLength(1);
      expect(userLogs[0].userId).toBe(userId1);
    });
  });

  describe('Log Retrieval', () => {
    it('should get recent logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      const recentLogs = logger.getRecentLogs(2);
      expect(recentLogs).toHaveLength(2);
      expect(recentLogs[0].message).toBe('Message 2');
      expect(recentLogs[1].message).toBe('Message 3');
    });

    it('should get logs by time range', () => {
      const startTime = new Date();
      logger.info('Message 1');
      logger.info('Message 2');
      const endTime = new Date();
      const timeRangeLogs = logger.getLogsByTimeRange(startTime, endTime);
      expect(timeRangeLogs).toHaveLength(2);
    });
  });

  describe('Log Statistics', () => {
    it('should track log counts by level', () => {
      logger.debug('Debug 1');
      logger.debug('Debug 2');
      logger.info('Info 1');
      logger.warn('Warn 1');
      logger.error('Error 1');

      const stats = logger.getLogStats();
      expect(stats.debug).toBe(2);
      expect(stats.info).toBe(1);
      expect(stats.warn).toBe(1);
      expect(stats.error).toBe(1);
    });
  });

  describe('Log Export', () => {
    it('should export logs as JSON', () => {
      logger.info('Test message');
      const jsonExport = logger.exportLogs('json');
      expect(jsonExport).toContain('Test message');
      expect(jsonExport).toContain('info');
    });

    it('should export logs as CSV', () => {
      logger.info('Test message');
      const csvExport = logger.exportLogs('csv');
      expect(csvExport).toContain('Test message');
      expect(csvExport).toContain('info');
    });
  });

  describe('Log Cleanup', () => {
    it('should clear all logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should clear logs by level', () => {
      logger.info('Info 1');
      logger.error('Error 1');
      logger.clearLogsByLevel('info');
      expect(logger.getLogs('info')).toHaveLength(0);
      expect(logger.getLogs('error')).toHaveLength(1);
    });

    it('should clear logs by user', () => {
      const userId = 'test-user';
      logger.info('Message 1', undefined, userId);
      logger.info('Message 2');
      logger.clearLogsByUser(userId);
      expect(logger.filterLogsByUser(userId)).toHaveLength(0);
      expect(logger.getLogs()).toHaveLength(1);
    });
  });
}); 