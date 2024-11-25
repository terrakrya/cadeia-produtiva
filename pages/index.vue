<template>
  <div></div>
</template>

<script>
export default {
  layout: 'front',

  async middleware({ store, redirect }) {
    if (process.client) {
      function isPwa() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const isIOSStandalone = window.navigator.standalone
        const isAndroidStandalone = document.referrer.includes('android-app://')
        return isStandalone || isIOSStandalone || isAndroidStandalone
      }

      function isMobileDevice() {
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        return mobileRegex.test(navigator.userAgent)
      }

      if (isPwa()) {
        return redirect('/login')
      } else if (isMobileDevice()) {
        return redirect('/install-pwa')
      } else {
        // If not mobile, go straight to login
        return redirect('/login')
      }
    }
    // Default to login for SSR
    return redirect('/login')
  },
}
</script>
