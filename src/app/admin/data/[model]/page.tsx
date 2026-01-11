import { fetchModelData } from '@/actions/admin-data';
import DataTable from '@/components/admin/DataTable';
import { getSchemaMetadata } from '@/lib/schema-metadata';
import { notFound } from 'next/navigation';

export default async function ModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const metadata = await getSchemaMetadata();
  const modelMeta = metadata.models.find(m => m.name === model);

  if (!modelMeta) {
    notFound();
  }

  const { data, total, page, totalPages } = await fetchModelData(model);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{model}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create New
        </button>
      </div>
      
      <DataTable data={data} fields={modelMeta.fields} />
      
      <div className="flex justify-between items-center text-sm text-gray-600">
         <div>Page {page} of {totalPages || 1} ({total} items)</div>
         {/* Pagination controls would go here */}
      </div>
    </div>
  );
}
