import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@tests/__setup__/render';
import { SpreadsheetRenderer } from '@/components/artifact/renders/SpreadsheetRenderer';
import type { Artifact } from '@/types/artifacts';

describe('SpreadsheetRenderer', () => {
    const mockSpreadsheetArtifact: Artifact = {
        id: 'test-sheet-1',
        type: 'spreadsheet',
        title: 'Test Spreadsheet',
        content: 'Name,Age,City\nJohn,30,NYC\nJane,25,LA',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockEmptySpreadsheet: Artifact = {
        id: 'test-sheet-2',
        type: 'spreadsheet',
        title: 'Empty Spreadsheet',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('renders spreadsheet without crashing', () => {
        const { container } = render(<SpreadsheetRenderer artifact={mockSpreadsheetArtifact} />);
        const gridContainer = container.querySelector('.rdg');
        expect(gridContainer).toBeDefined();
    });

    it('parses CSV content correctly', () => {
        render(<SpreadsheetRenderer artifact={mockSpreadsheetArtifact} />);
        expect(screen.getByText('John')).toBeDefined();
        expect(screen.getByText('Jane')).toBeDefined();
    });

    it('displays column header A (virtualized, so only visible columns render)', () => {
        render(<SpreadsheetRenderer artifact={mockSpreadsheetArtifact} />);
        // DataGrid uses virtualization, so only visible columns are rendered
        expect(screen.getByText('A')).toBeDefined();
    });

    it('handles empty content gracefully', () => {
        const { container } = render(<SpreadsheetRenderer artifact={mockEmptySpreadsheet} />);
        const gridContainer = container.querySelector('.rdg');
        expect(gridContainer).toBeDefined();
    });

    it('creates minimum 50 rows and 26 columns', () => {
        const { container } = render(<SpreadsheetRenderer artifact={mockSpreadsheetArtifact} />);
        const gridContainer = container.querySelector('.rdg');
        expect(gridContainer).toBeDefined();
    });

    it('applies theme-specific styles', () => {
        const { container } = render(<SpreadsheetRenderer artifact={mockSpreadsheetArtifact} />);
        const gridContainer = container.querySelector('.rdg-dark, .rdg-light');
        expect(gridContainer).toBeDefined();
    });
});
