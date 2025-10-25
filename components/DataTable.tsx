
import React, { useState, useRef, useEffect } from 'react';
import { type TableData } from '../types';

interface DataTableProps {
    data: TableData;
    onDataChange: (rowIndex: number, colIndex: number, value: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onDataChange }) => {
    const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
    const [cellValue, setCellValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingCell]);

    const handleCellClick = (row: number, col: number) => {
        setEditingCell({ row, col });
        setCellValue(data[row][col] || '');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCellValue(e.target.value);
    };

    const handleInputBlur = () => {
        if (editingCell) {
            onDataChange(editingCell.row, editingCell.col, cellValue);
            setEditingCell(null);
        }
    };
    
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
        if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    if (!data || data.length === 0) {
        return <p className="p-4 text-[#e2e2e2]/70">No data to display.</p>;
    }
    
    const maxColumns = Math.max(...data.map(row => row.length));

    return (
        <div className="w-full overflow-x-auto bg-black/20 border border-[#e2e2e2]/20 rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-[#e2e2e2]/20">
                <thead className="bg-black/10">
                    <tr>
                        {Array.from({ length: maxColumns }).map((_, colIndex) => (
                            <th
                                key={colIndex}
                                scope="col"
                                className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-[#e2e2e2]/80 uppercase tracking-wider"
                            >
                                Column {colIndex + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e2]/20">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-white/5">
                            {Array.from({ length: maxColumns }).map((_, colIndex) => {
                                const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                                return (
                                    <td
                                        key={colIndex}
                                        className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-[#e2e2e2] relative"
                                        onClick={() => !isEditing && handleCellClick(rowIndex, colIndex)}
                                    >
                                        {isEditing ? (
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={cellValue}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                onKeyDown={handleInputKeyDown}
                                                className="w-full p-1 border-2 border-blue-500 rounded-md outline-none bg-[#5e5e5e] text-[#e2e2e2]"
                                            />
                                        ) : (
                                            <span className="block min-h-[1rem] sm:min-h-[1.25rem]">{row[colIndex] || ''}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
