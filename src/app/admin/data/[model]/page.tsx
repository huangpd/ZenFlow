import { fetchModelData } from '@/actions/admin-data';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import { getSchemaMetadata } from '@/lib/schema-metadata';
import { notFound } from 'next/navigation';
import Link from 'next/link';

/**
 * 通用模型数据列表页面
 * 动态展示指定模型(model)的数据列表，包含分页和创建入口
 */
export default async function ModelPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ model: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { model } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParam = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const metadata = await getSchemaMetadata();
  const modelMeta = metadata.models.find(m => m.name === model);

  if (!modelMeta) {
    notFound();
  }

  const { data, total, page, totalPages } = await fetchModelData(model, currentPage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{model}</h1>
        <Link 
          href={`/admin/data/${model}/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>
      
      <DataTable data={data} fields={modelMeta.fields} modelName={model} />
      
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
         <div className="text-sm text-gray-500">
            Total records: <span className="font-medium text-gray-900">{total}</span>
         </div>
         <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            baseUrl={`/admin/data/${model}`} 
         />
      </div>
    </div>
  );
}
