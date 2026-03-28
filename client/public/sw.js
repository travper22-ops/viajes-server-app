// Service Worker — Flash Deals Push Notifications
const CACHE_NAME = 'travel-agency-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Recibir notificación push
self.addEventListener('push', event => {
  let data = { title: '✈ Oferta Flash', body: 'Nueva oferta de última hora disponible', url: '/vuelos' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/img/favicon.png',
      badge: '/img/favicon.png',
      tag: 'flash-deal',
      renotify: true,
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: 'Ver oferta' },
        { action: 'close', title: 'Cerrar' },
      ],
    })
  );
});

// Click en la notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin));
      if (existing) { existing.focus(); existing.navigate(url); }
      else self.clients.openWindow(url);
    })
  );
});
