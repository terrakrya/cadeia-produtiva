/* eslint-disable no-undef */
const bgSyncPlugin = new BackgroundSyncPlugin('failedPostsQueue', {
  maxRetentionTime: 8640 * 60, // Retry for max of 24 Hours (specified in minutes)
})

registerRoute(
  /.*\/api\/.*/,
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
)
// eslint-disable-next-line no-console
console.log('workbox running...')
