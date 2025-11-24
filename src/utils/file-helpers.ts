export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.slice(lastDot + 1).toLowerCase() : '';
}

export function getFileType(
    mediaType: string | undefined,
    filename?: string
): 'image' | 'pdf' | 'document' | 'unknown' {
    if (mediaType) {
        if (mediaType.startsWith('image/')) return 'image';
        if (mediaType === 'application/pdf') return 'pdf';
        if (
            mediaType.startsWith('application/msword') ||
            mediaType.startsWith('application/vnd.openxmlformats-officedocument') ||
            mediaType.startsWith('application/vnd.ms-excel') ||
            mediaType === 'text/plain'
        ) {
            return 'document';
        }
    }

    if (filename) {
        const ext = getFileExtension(filename);
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (['doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'].includes(ext)) return 'document';
    }

    return 'unknown';
}

export function getFileIcon(fileType: 'image' | 'pdf' | 'document' | 'unknown'): string {
    switch (fileType) {
        case 'pdf':
            return '📄';
        case 'document':
            return '📝';
        case 'image':
            return '🖼️';
        default:
            return '📎';
    }
}

export function isImageFile(mediaType: string | undefined, filename?: string): boolean {
    return getFileType(mediaType, filename) === 'image';
}

export function isPDFFile(mediaType: string | undefined, filename?: string): boolean {
    return getFileType(mediaType, filename) === 'pdf';
}

export function isDocumentFile(mediaType: string | undefined, filename?: string): boolean {
    return getFileType(mediaType, filename) === 'document';
}

export function getAcceptedFileTypes(): string {
    return 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv';
}

export function validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
}

export function validateFileType(file: File): boolean {
    const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ];

    return validTypes.includes(file.type) || getFileType(file.type, file.name) !== 'unknown';
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}
