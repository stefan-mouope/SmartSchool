import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className={`px-6 py-3 text-sm font-medium text-muted-foreground text-${column.align || 'left'}`}
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-3 text-center text-sm font-medium text-muted-foreground">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-muted/50 transition-colors">
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className={`px-6 py-4 text-sm text-${column.align || 'left'}`}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 text-center">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(row.id)}
                      className="text-primary hover:text-primary/80 mx-2 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(row.id)}
                      className="text-destructive hover:text-destructive/80 mx-2 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
