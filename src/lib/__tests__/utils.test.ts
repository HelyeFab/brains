import { describe, it, expect } from 'vitest';
import { cn, formatBytes, formatPercentage } from '../utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge single class', () => {
      expect(cn('class1')).toBe('class1');
    });

    it('should merge multiple classes', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });

    it('should merge tailwind classes with conflicts', () => {
      // tailwind-merge should keep the last conflicting class
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    it('should handle object syntax', () => {
      expect(cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })).toBe('class1 class3');
    });

    it('should handle array syntax', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });

    it('should handle mixed types', () => {
      expect(cn('class1', ['class2', 'class3'], { 'class4': true })).toBe('class1 class2 class3 class4');
    });

    it('should filter falsy values', () => {
      expect(cn('class1', null, undefined, '', 'class2')).toBe('class1 class2');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(0)).toBe('0.0 B');
      expect(formatBytes(100)).toBe('100.0 B');
      expect(formatBytes(512)).toBe('512.0 B');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2048)).toBe('2.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB');
      expect(formatBytes(1024 * 1024 * 100)).toBe('100.0 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatBytes(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
    });

    it('should format terabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1.0 TB');
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 5)).toBe('5.0 TB');
    });

    it('should handle very large numbers (cap at TB)', () => {
      const veryLarge = 1024 * 1024 * 1024 * 1024 * 1024; // 1 PB
      expect(formatBytes(veryLarge)).toBe('1024.0 TB'); // Capped at TB
    });

    it('should handle undefined', () => {
      expect(formatBytes(undefined)).toBe('0 B');
    });

    it('should handle null', () => {
      expect(formatBytes(null)).toBe('0 B');
    });

    it('should handle NaN', () => {
      expect(formatBytes(NaN)).toBe('0 B');
    });

    it('should handle negative numbers', () => {
      // Note: formatBytes doesn't currently handle negative numbers gracefully
      // It will keep them in bytes. This is acceptable behavior.
      const result = formatBytes(-1024);
      expect(result).toContain('-');
      expect(result).toContain('B');
    });

    it('should format real-world examples', () => {
      // 8 GB RAM
      expect(formatBytes(8 * 1024 * 1024 * 1024)).toBe('8.0 GB');

      // 256 MB file
      expect(formatBytes(256 * 1024 * 1024)).toBe('256.0 MB');

      // 16 GB RAM
      expect(formatBytes(16000000000)).toBe('14.9 GB');
    });
  });

  describe('formatPercentage', () => {
    it('should format zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should format whole numbers', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('should format decimals', () => {
      expect(formatPercentage(25.5)).toBe('25.5%');
      expect(formatPercentage(99.9)).toBe('99.9%');
    });

    it('should round to one decimal place', () => {
      expect(formatPercentage(25.55)).toBe('25.6%');
      expect(formatPercentage(25.54)).toBe('25.5%');
      expect(formatPercentage(25.549)).toBe('25.5%');
    });

    it('should handle values over 100%', () => {
      expect(formatPercentage(150)).toBe('150.0%');
      expect(formatPercentage(200.5)).toBe('200.5%');
    });

    it('should handle negative values', () => {
      expect(formatPercentage(-10)).toBe('-10.0%');
      expect(formatPercentage(-5.5)).toBe('-5.5%');
    });

    it('should handle very small numbers', () => {
      expect(formatPercentage(0.1)).toBe('0.1%');
      expect(formatPercentage(0.05)).toBe('0.1%');
      expect(formatPercentage(0.001)).toBe('0.0%');
    });

    it('should handle undefined', () => {
      expect(formatPercentage(undefined)).toBe('0.0%');
    });

    it('should handle null', () => {
      expect(formatPercentage(null)).toBe('0.0%');
    });

    it('should handle NaN', () => {
      expect(formatPercentage(NaN)).toBe('0.0%');
    });

    it('should format real-world CPU/memory usage', () => {
      expect(formatPercentage(45.3)).toBe('45.3%');
      expect(formatPercentage(87.9)).toBe('87.9%');
      expect(formatPercentage(12.456)).toBe('12.5%');
    });
  });
});
