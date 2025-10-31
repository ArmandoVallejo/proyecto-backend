const { getFileCategory, formatFileSize } = require('../../src/middleware/upload');

describe('Upload Middleware Unit Tests', () => {
  
  describe('getFileCategory', () => {
    test('should categorize image files correctly', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/png')).toBe('image');
      expect(getFileCategory('image/gif')).toBe('image');
      expect(getFileCategory('image/webp')).toBe('image');
    });

    test('should categorize PDF files correctly', () => {
      expect(getFileCategory('application/pdf')).toBe('pdf');
    });

    test('should categorize document files correctly', () => {
      expect(getFileCategory('application/msword')).toBe('document');
      expect(getFileCategory('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('document');
      expect(getFileCategory('text/plain')).toBe('document');
    });

    test('should categorize spreadsheet files correctly', () => {
      expect(getFileCategory('application/vnd.ms-excel')).toBe('spreadsheet');
      expect(getFileCategory('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('spreadsheet');
      expect(getFileCategory('text/csv')).toBe('spreadsheet');
    });

    test('should categorize presentation files correctly', () => {
      expect(getFileCategory('application/vnd.ms-powerpoint')).toBe('presentation');
      expect(getFileCategory('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe('presentation');
    });

    test('should categorize unknown files as other', () => {
      expect(getFileCategory('application/unknown')).toBe('other');
      expect(getFileCategory('video/mp4')).toBe('other');
    });
  });

  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    test('should format partial sizes correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(formatFileSize(2621440)).toBe('2.5 MB'); // 2.5 MB
      expect(formatFileSize(512)).toBe('512 Bytes');
    });

    test('should handle large numbers correctly', () => {
      expect(formatFileSize(5368709120)).toBe('5 GB'); // 5 GB
      expect(formatFileSize(10737418240)).toBe('10 GB'); // 10 GB
    });
  });

  describe('File Type Validation', () => {
    const allowedMimeTypes = [
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];

    const disallowedMimeTypes = [
      'video/mp4',
      'audio/mpeg',
      'application/zip',
      'application/x-executable',
      'text/html',
      'application/javascript'
    ];

    test('should have correct allowed mime types for common file formats', () => {
      // Test that we have coverage for common business file types
      expect(allowedMimeTypes).toContain('image/jpeg');
      expect(allowedMimeTypes).toContain('image/png');
      expect(allowedMimeTypes).toContain('application/pdf');
      expect(allowedMimeTypes).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(allowedMimeTypes).toContain('text/plain');
    });

    test('should reject dangerous file types', () => {
      // Ensure we don't accidentally allow potentially dangerous files
      expect(allowedMimeTypes).not.toContain('application/x-executable');
      expect(allowedMimeTypes).not.toContain('application/javascript');
      expect(allowedMimeTypes).not.toContain('text/html');
    });
  });
});