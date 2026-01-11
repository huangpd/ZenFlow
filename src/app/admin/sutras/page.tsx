import { getSutras } from '@/actions/admin';
import SutraManager from '@/components/admin/SutraManager';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminSutrasPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const sutras = await getSutras();

  return <SutraManager initialSutras={sutras} />;
}
