import { handlers } from '@/auth';

/**
 * NextAuth 认证 API 路由
 * 导出 GET 和 POST 处理函数，接管所有 /api/auth/* 的认证请求
 */
export const { GET, POST } = handlers;
