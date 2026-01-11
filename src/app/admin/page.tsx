import { getSchemaMetadata } from '@/lib/schema-metadata';
import Link from 'next/link';

export default async function AdminPage() {
  const metadata = await getSchemaMetadata();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome to ZenFlow Admin</h1>
      <p className="text-gray-600">Select a data model to manage:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metadata.models.map(model => (
          <Link 
            key={model.name} 
            href={`/admin/data/${model.name}`}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800">{model.name}</h3>
            <p className="text-sm text-gray-500 mt-2">{model.fields.length} fields</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
