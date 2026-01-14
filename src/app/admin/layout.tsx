import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getSchemaMetadata } from '@/lib/schema-metadata';

/**
 * 管理后台布局组件
 * 负责后台页面的整体结构，包含权限验证(仅管理员可访问)和左侧导航栏
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect('/auth/login');
  }

  if (!isAdmin(session.user.email)) {
    redirect('/dashboard'); 
  }

  const metadata = await getSchemaMetadata();

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
      <AdminSidebar models={metadata.models} />
      <div className="flex-1 flex flex-col min-w-0">
          <div className="hidden md:flex bg-white border-b p-4 justify-between items-center">
             <h2 className="font-bold text-gray-700">Dashboard</h2>
             <div className="text-sm text-gray-600">{session.user.email}</div>
          </div>
          <main className="flex-1 p-6 overflow-x-auto">
            {children}
          </main>
      </div>
    </div>
  );
}