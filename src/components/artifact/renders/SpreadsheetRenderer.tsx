import { memo, useEffect, useMemo, useState } from 'react';
import { DataGrid, textEditor, type CellMouseArgs } from 'react-data-grid';
import { parse, unparse } from 'papaparse';
import { useThemeContext } from '@/hooks/useThemeContext';
import type { Artifact } from '@/types/artifacts';
import { cn } from '@/lib/utils';

import 'react-data-grid/lib/styles.css';

interface SpreadsheetRendererProps {
    artifact: Artifact;
    onContentChange?: (content: string) => void;
    status?: 'streaming' | 'idle';
}

const MIN_ROWS = 50;
const MIN_COLS = 26;

type RowData = {
    id: number;
    rowNumber: number;
    [key: string]: string | number;
};

function PureSpreadsheetRenderer({ artifact }: SpreadsheetRendererProps) {
    const { theme } = useThemeContext();

    const parseData = useMemo(() => {
        if (!artifact.content) return Array(MIN_ROWS).fill(Array(MIN_COLS).fill(''));
        const result = parse<string[]>(artifact.content, { skipEmptyLines: true });

        const paddedData = result.data.map((row: string[]) => {
            const paddedRow = [...row];
            while (paddedRow.length < MIN_COLS) {
                paddedRow.push('');
            }
            return paddedRow;
        });

        while (paddedData.length < MIN_ROWS) {
            paddedData.push(Array(MIN_COLS).fill(''));
        }

        return paddedData;
    }, [artifact.content]);

    const columns = useMemo(() => {
        const rowNumberColumn = {
            key: 'rowNumber',
            name: '',
            frozen: true,
            width: 50,
            renderCell: ({ rowIdx }: { rowIdx: number }) => rowIdx + 1,
            cellClass: 'border-t border-r dark:bg-warm-black-600 dark:text-light-grey-100',
            headerCellClass: 'border-t border-r dark:bg-warm-black-700 dark:text-light-grey-100',
        };

        const dataColumns = Array.from({ length: MIN_COLS }, (_, i) => ({
            key: i.toString(),
            name: String.fromCharCode(65 + i),
            renderEditCell: textEditor,
            width: 120,
            cellClass: cn('border-t dark:bg-warm-black-600 dark:text-light-grey-100', {
                'border-l': i !== 0,
            }),
            headerCellClass: cn('border-t dark:bg-warm-black-700 dark:text-light-grey-100', {
                'border-l': i !== 0,
            }),
        }));

        return [rowNumberColumn, ...dataColumns];
    }, []);

    const initialRows = useMemo(() => {
        return parseData.map((row: string[], rowIndex: number): RowData => {
            const rowData: RowData = {
                id: rowIndex,
                rowNumber: rowIndex + 1,
            };

            columns.slice(1).forEach((col, colIndex) => {
                rowData[col.key] = row[colIndex] || '';
            });

            return rowData;
        });
    }, [parseData, columns]);

    const [localRows, setLocalRows] = useState(initialRows);

    useEffect(() => {
        setLocalRows(initialRows);
    }, [initialRows]);

    const handleRowsChange = (newRows: RowData[]) => {
        setLocalRows(newRows);

        const updatedData = newRows.map((row) => {
            return columns.slice(1).map((col) => (row[col.key] as string) || '');
        });

        const newCsvContent = unparse(updatedData);

        // TODO: Wire up to artifact store's updateArtifactContent when saving is implemented
        console.log('[SpreadsheetRenderer] Content changed (not saved yet):', newCsvContent);
    };

    return (
        <div className="flex h-full w-full flex-col">
            <DataGrid
                className={theme === 'dark' ? 'rdg-dark' : 'rdg-light'}
                columns={columns}
                rows={localRows}
                enableVirtualization
                onRowsChange={handleRowsChange}
                onCellClick={(args: CellMouseArgs<RowData>) => {
                    if (args.column.key !== 'rowNumber') {
                        args.selectCell(true);
                    }
                }}
                style={{ height: '100%', minHeight: '400px' }}
                defaultColumnOptions={{
                    resizable: true,
                    sortable: true,
                }}
            />
        </div>
    );
}

function areEqual(prevProps: SpreadsheetRendererProps, nextProps: SpreadsheetRendererProps) {
    if (prevProps.status === 'streaming' && nextProps.status === 'streaming') return false;
    if (prevProps.artifact.content !== nextProps.artifact.content) return false;
    if (prevProps.artifact.updatedAt !== nextProps.artifact.updatedAt) return false;

    return true;
}

export const SpreadsheetRenderer = memo(PureSpreadsheetRenderer, areEqual);
export default SpreadsheetRenderer;
