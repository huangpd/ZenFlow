'use client';

import React, { useState, useEffect } from 'react';
import { FieldMetadata } from '@/lib/schema-metadata';
import { fetchRelatedList } from '@/actions/admin-data';

interface DynamicFormProps {
  fields: FieldMetadata[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void> | void;
  modelName: string;
}

export default function DynamicForm({ fields, initialData = {}, onSubmit }: DynamicFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [relationOptions, setRelationOptions] = useState<Record<string, {id: string, label: string}[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelations = async () => {
       const relationFields = fields.filter(f => f.kind === 'object' && f.relationFromFields && f.relationFromFields.length > 0);
       for (const rel of relationFields) {
         if (typeof rel.type === 'string') {
             try {
                const options = await fetchRelatedList(rel.type);
                const fkName = rel.relationFromFields![0];
                setRelationOptions(prev => ({ ...prev, [fkName]: options }));
             } catch (e) {
                console.error("Failed to load relation options", e);
             }
         }
       }
    };
    loadRelations();
  }, [fields]);

  const editableFields = fields.filter(f => 
    !f.isId && 
    !f.relationName && 
    !['createdAt', 'updatedAt'].includes(f.name) &&
    f.kind === 'scalar'
  );

  const handleChange = (name: string, value: string, type: string | object) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsedValue: any = value;
    if (type === 'Int') {
      parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) parsedValue = value; 
    } else if (type === 'Boolean') {
        parsedValue = value === 'true'; 
    }

    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
        await onSubmit(formData);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred during submission.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
      {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
              {error}
          </div>
      )}
      {editableFields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.name}
          </label>
          {field.type === 'Boolean' ? (
             <select
                id={field.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={formData[field.name] === undefined || formData[field.name] === null ? 'false' : String(formData[field.name])}
                onChange={e => handleChange(field.name, e.target.value, 'Boolean')}
             >
                 <option value="true">Yes</option>
                 <option value="false">No</option>
             </select>
          ) : relationOptions[field.name] ? (
              <select
                id={field.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={formData[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value, field.type)}
                required={field.isRequired}
              >
                  <option value="">Select...</option>
                  {relationOptions[field.name].map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
              </select>
          ) : (
            <input
                type={field.type === 'Int' ? 'number' : 'text'}
                id={field.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={formData[field.name] || ''}
                onChange={e => handleChange(field.name, e.target.value, field.type)}
                required={field.isRequired && !field.hasDefaultValue}
            />
          )}
        </div>
      ))}
      <button 
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save
      </button>
    </form>
  );
}
