// Service Worker for keeping meditation timer alive in background
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'KEEP_ALIVE') {
    // 确保Service Worker保持活跃状态
    console.log('Keep alive signal received at', new Date().toISOString());
  }
});

// 定期检查连接的clients
self.addEventListener('message', async (event) => {
  if (event.data.type === 'KEEP_ALIVE') {
    try {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        // 发送心跳信号给客户端
        client.postMessage({
          type: 'SERVICE_WORKER_ALIVE',
          timestamp: Date.now()
        });
      });
    } catch (error) {
      console.error('Error in keep-alive handler:', error);
    }
  }
});
