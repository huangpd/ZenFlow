import { getUserSutras } from '@/actions/user-sutras';
import SutraManager from '@/components/admin/SutraManager';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * 用户佛经管理页面
 * 用户可以创建和管理自己的私有佛经模板
 */
export default async function MySutrasPage() {
    const session = await auth();
    if (!session) {
        redirect('/auth/login');
    }

    const sutras = await getUserSutras();

    return <SutraManager initialSutras={sutras} mode="user" />;
}
