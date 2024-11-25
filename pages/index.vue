<template>
  <div></div>
</template>

<script>
export default {
  layout: 'front',

  async middleware({ store, redirect }) {
    if (process.client) {
      function isPwa() {
        const isStandalone = window.matchMedia(
          '(display-mode: standalone)'
        ).matches
        const isIOSStandalone = window.navigator.standalone
        const isAndroidStandalone = document.referrer.includes('android-app://')

        return isStandalone || isIOSStandalone || isAndroidStandalone
      }

      if (isPwa()) {
        return redirect('/login')
      } else {
        return redirect('/install-pwa')
      }
    }
    // Default to login for SSR
    return redirect('/login')
  },
}
</script>
