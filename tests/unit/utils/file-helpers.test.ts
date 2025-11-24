import { describe, it, expect } from 'vitest';
import {
    getFileExtension,
    getFileType,
    getFileIcon,
    isImageFile,
    isPDFFile,
    isDocumentFile,
    getAcceptedFileTypes,
    validateFileSize,
    validateFileType,
    formatFileSize,
    formatRelativeTime,
} from '@/utils/file-helpers';

describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
        expect(getFileExtension('document.pdf')).toBe('pdf');
        expect(getFileExtension('image.PNG')).toBe('png');
        expect(getFileExtension('file.with.dots.txt')).toBe('txt');
    });

    it('should return empty string for files without extension', () => {
        expect(getFileExtension('noextension')).toBe('');
        expect(getFileExtension('')).toBe('');
    });
});

describe('getFileType', () => {
    it('should identify image files by media type', () => {
        expect(getFileType('image/jpeg')).toBe('image');
        expect(getFileType('image/png')).toBe('image');
        expect(getFileType('image/gif')).toBe('image');
    });

    it('should identify PDF files by media type', () => {
        expect(getFileType('application/pdf')).toBe('pdf');
    });

    it('should identify document files by media type', () => {
        expect(getFileType('application/msword')).toBe('document');
        expect(getFileType('application/vnd.openxmlformats-officedocument')).toBe('document');
        expect(getFileType('application/vnd.ms-excel')).toBe('document');
        expect(getFileType('text/plain')).toBe('document');
    });

    it('should identify files by extension when media type is missing', () => {
        expect(getFileType(undefined, 'photo.jpg')).toBe('image');
        expect(getFileType(undefined, 'document.pdf')).toBe('pdf');
        expect(getFileType(undefined, 'spreadsheet.xlsx')).toBe('document');
    });

    it('should return unknown for unrecognized types', () => {
        expect(getFileType('application/unknown')).toBe('unknown');
        expect(getFileType(undefined, 'file.xyz')).toBe('unknown');
    });

    it('should handle all image extensions', () => {
        expect(getFileType(undefined, 'image.jpg')).toBe('image');
        expect(getFileType(undefined, 'image.jpeg')).toBe('image');
        expect(getFileType(undefined, 'image.png')).toBe('image');
        expect(getFileType(undefined, 'image.gif')).toBe('image');
        expect(getFileType(undefined, 'image.webp')).toBe('image');
        expect(getFileType(undefined, 'image.svg')).toBe('image');
    });

    it('should handle all document extensions', () => {
        expect(getFileType(undefined, 'file.doc')).toBe('document');
        expect(getFileType(undefined, 'file.docx')).toBe('document');
        expect(getFileType(undefined, 'file.xls')).toBe('document');
        expect(getFileType(undefined, 'file.xlsx')).toBe('document');
        expect(getFileType(undefined, 'file.txt')).toBe('document');
        expect(getFileType(undefined, 'file.csv')).toBe('document');
    });
});

describe('getFileIcon', () => {
    it('should return correct icons for each file type', () => {
        expect(getFileIcon('pdf')).toBe('📄');
        expect(getFileIcon('document')).toBe('📝');
        expect(getFileIcon('image')).toBe('🖼️');
        expect(getFileIcon('unknown')).toBe('📎');
    });
});

describe('isImageFile', () => {
    it('should return true for image files', () => {
        expect(isImageFile('image/jpeg')).toBe(true);
        expect(isImageFile(undefined, 'photo.png')).toBe(true);
    });

    it('should return false for non-image files', () => {
        expect(isImageFile('application/pdf')).toBe(false);
        expect(isImageFile(undefined, 'document.docx')).toBe(false);
    });
});

describe('isPDFFile', () => {
    it('should return true for PDF files', () => {
        expect(isPDFFile('application/pdf')).toBe(true);
        expect(isPDFFile(undefined, 'document.pdf')).toBe(true);
    });

    it('should return false for non-PDF files', () => {
        expect(isPDFFile('image/jpeg')).toBe(false);
        expect(isPDFFile(undefined, 'document.docx')).toBe(false);
    });
});

describe('isDocumentFile', () => {
    it('should return true for document files', () => {
        expect(isDocumentFile('application/msword')).toBe(true);
        expect(isDocumentFile(undefined, 'file.docx')).toBe(true);
    });

    it('should return false for non-document files', () => {
        expect(isDocumentFile('image/jpeg')).toBe(false);
        expect(isDocumentFile(undefined, 'photo.jpg')).toBe(false);
    });
});

describe('getAcceptedFileTypes', () => {
    it('should return the correct accepted file types string', () => {
        expect(getAcceptedFileTypes()).toBe('image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv');
    });
});

describe('validateFileSize', () => {
    it('should validate files within size limit', () => {
        const smallFile = new File(['x'.repeat(1024)], 'small.txt', { type: 'text/plain' });
        expect(validateFileSize(smallFile, 10)).toBe(true);
    });

    it('should reject files exceeding size limit', () => {
        const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', {
            type: 'text/plain',
        });
        expect(validateFileSize(largeFile, 10)).toBe(false);
    });

    it('should use default 10MB limit', () => {
        const file = new File(['x'.repeat(5 * 1024 * 1024)], 'file.txt', { type: 'text/plain' });
        expect(validateFileSize(file)).toBe(true);
    });

    it('should handle exact size match', () => {
        const file = new File(['x'.repeat(10 * 1024 * 1024)], 'exact.txt', { type: 'text/plain' });
        expect(validateFileSize(file, 10)).toBe(true);
    });
});

describe('validateFileType', () => {
    it('should validate image types', () => {
        const jpegFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
        const pngFile = new File([''], 'image.png', { type: 'image/png' });
        expect(validateFileType(jpegFile)).toBe(true);
        expect(validateFileType(pngFile)).toBe(true);
    });

    it('should validate PDF type', () => {
        const pdfFile = new File([''], 'doc.pdf', { type: 'application/pdf' });
        expect(validateFileType(pdfFile)).toBe(true);
    });

    it('should validate document types', () => {
        const docFile = new File([''], 'doc.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        expect(validateFileType(docFile)).toBe(true);
    });

    it('should fallback to filename validation', () => {
        const fileWithUnknownType = new File([''], 'image.jpg', { type: '' });
        expect(validateFileType(fileWithUnknownType)).toBe(true);
    });

    it('should reject invalid file types', () => {
        const invalidFile = new File([''], 'file.exe', { type: 'application/x-msdownload' });
        expect(validateFileType(invalidFile)).toBe(false);
    });
});

describe('formatFileSize', () => {
    it('should format bytes', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
        expect(formatFileSize(100)).toBe('100 Bytes');
        expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
        expect(formatFileSize(1024 * 1024)).toBe('1 MB');
        expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });

    it('should format gigabytes', () => {
        expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
        expect(formatFileSize(5.75 * 1024 * 1024 * 1024)).toBe('5.75 GB');
    });
});

describe('formatRelativeTime', () => {
    it('should return "just now" for recent times', () => {
        const now = new Date().toISOString();
        expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should format minutes', () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should format single minute', () => {
        const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
        expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should format hours', () => {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
    });

    it('should format single hour', () => {
        const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should format days', () => {
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(fiveDaysAgo)).toBe('5 days ago');
    });

    it('should format single day', () => {
        const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('should format months', () => {
        const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago');
    });

    it('should format single month', () => {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(oneMonthAgo)).toBe('1 month ago');
    });

    it('should format years', () => {
        const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(twoYearsAgo)).toBe('2 years ago');
    });

    it('should format single year', () => {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        expect(formatRelativeTime(oneYearAgo)).toBe('1 year ago');
    });
});
