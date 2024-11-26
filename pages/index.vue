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

      function isMobileDevice() {
        if (
          navigator.userAgentData &&
          navigator.userAgentData.mobile !== undefined
        ) {
          return navigator.userAgentData.mobile
        }

        const isTouchDevice =
          'ontouchstart' in window || navigator.maxTouchPoints > 0
        const isSmallScreen = window.matchMedia('(max-width: 767px)').matches
        return isTouchDevice && isSmallScreen
      }

      if (isPwa()) {
        return redirect('/login')
      } else if (isMobileDevice()) {
        return redirect('/install-pwa')
      } else {
        return redirect('/login')
      }
    }
    return redirect('/login')
  },
}
</script>
