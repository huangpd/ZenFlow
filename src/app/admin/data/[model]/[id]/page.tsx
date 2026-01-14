import DynamicForm from '@/components/admin/DynamicForm';
import { getSchemaMetadata } from '@/lib/schema-metadata';
import { updateRecord, fetchRecord } from '@/actions/admin-data';
import { notFound, redirect } from 'next/navigation';

/**
 * 编辑记录页面
 * 根据模型名称(model)和记录ID(id)加载数据，并提供表单进行编辑更新
 */
export default async function EditRecordPage({ params }: { params: Promise<{ model: string; id: string }> }) {
  const { model, id } = await params;
  const metadata = await getSchemaMetadata();
  const modelMeta = metadata.models.find(m => m.name === model);

  if (!modelMeta) notFound();

  const record = await fetchRecord(model, id);
  if (!record) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    'use server';
    await updateRecord(model, id, data);
    redirect(`/admin/data/${model}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit {model}</h1>
      <DynamicForm 
         fields={modelMeta.fields} 
         modelName={model} 
         initialData={record}
         onSubmit={onSubmit} 
      />
    </div>
  );
}
