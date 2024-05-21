importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

workbox.core.skipWaiting();
workbox.core.clientsClaim();

workbox.routing.registerRoute(
  new RegExp('.*'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'dynamic-content',
  })
);
