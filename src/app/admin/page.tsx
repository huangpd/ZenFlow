import { getSchemaMetadata } from '@/lib/schema-metadata';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/**
 * 管理后台首页
 * 提供系统管理功能的概览和快捷入口，包括专用工具和底层数据库管理
 */
export default async function AdminPage() {
  const metadata = await getSchemaMetadata();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">ZenFlow 控制台</h1>
        <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">返回功课大厅</Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> 专业管理工具
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/admin/sutras"
            className="group block p-6 bg-emerald-50 rounded-2xl shadow-sm hover:shadow-md transition-all border border-emerald-100"
          >
            <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700">佛经管理 (专业版)</h3>
            <p className="text-sm text-emerald-600/70 mt-2">可视化管理经文内容、默认计数与配置</p>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-500 uppercase tracking-wider">数据库底层管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metadata.models.map(model => (
            <Link 
              key={model.name} 
              href={`/admin/data/${model.name}`}
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-800">{model.name}</h3>
              <p className="text-sm text-slate-400 mt-2">{model.fields.length} fields</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
