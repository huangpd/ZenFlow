'use client';

import React from 'react';
import { FieldMetadata } from '@/lib/schema-metadata';

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  fields: FieldMetadata[];
}

export default function DataTable({ data, fields }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div className="p-4 text-gray-500 border rounded-lg bg-white">No records found.</div>;
  }

  const displayFields = fields.filter(f => f.kind === 'scalar' || f.kind === 'enum');

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {displayFields.map(field => (
              <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {field.name}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50">
              {displayFields.map(field => (
                <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                  {formatValue(row[field.name], field.type)}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                 <button className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatValue(value: any, type: any): string {
  if (value === null || value === undefined) return '-';
  if (type === 'DateTime' || value instanceof Date) return new Date(value).toLocaleString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
