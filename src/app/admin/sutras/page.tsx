import { getSutras } from '@/actions/admin';
import SutraManager from '@/components/admin/SutraManager';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * 佛经管理页面
 * 专门用于管理系统中的佛经数据，支持查看和编辑
 */
export default async function AdminSutrasPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const sutras = await getSutras();

  return <SutraManager initialSutras={sutras} />;
}
