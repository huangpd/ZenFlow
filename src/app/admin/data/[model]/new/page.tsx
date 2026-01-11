import DynamicForm from '@/components/admin/DynamicForm';
import { getSchemaMetadata } from '@/lib/schema-metadata';
import { createRecord } from '@/actions/admin-data';
import { notFound, redirect } from 'next/navigation';

export default async function NewRecordPage({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const metadata = await getSchemaMetadata();
  const modelMeta = metadata.models.find(m => m.name === model);

  if (!modelMeta) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    'use server';
    await createRecord(model, data);
    redirect(`/admin/data/${model}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create {model}</h1>
      <DynamicForm 
         fields={modelMeta.fields} 
         modelName={model} 
         onSubmit={onSubmit} 
      />
    </div>
  );
}
