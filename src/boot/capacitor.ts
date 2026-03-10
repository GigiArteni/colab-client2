/**
 * Capacitor Boot File
 * Handles Capacitor-specific initialization for mobile apps
 */

import { defineBoot } from '#q-app/wrappers';
import { Platform } from 'quasar';

export default defineBoot(() => {
  // Only run on Capacitor (native mobile)
  if (!Platform.is.capacitor) {
    return;
  }

  // Initialize capacitor plugins
  void initCapacitor();
});

async function initCapacitor(): Promise<void> {
  // Dynamic import to avoid loading on web
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  const { SplashScreen } = await import('@capacitor/splash-screen');

  try {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Light });

    if (Platform.is.android) {
      await StatusBar.setBackgroundColor({ color: '#1976D2' });
    }

    // Hide splash screen after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    await SplashScreen.hide();
  } catch (error) {
    console.warn('[Capacitor] Plugin error:', error);
  }
}
