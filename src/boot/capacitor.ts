/**
 * Capacitor Boot File
 * Handles Capacitor-specific initialization for mobile apps
 */

import type { StatusBar as StatusBarType, Style as StyleType } from '@capacitor/status-bar';
import type { SplashScreen as SplashScreenType } from '@capacitor/splash-screen';
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
  try {
    // Dynamic imports are vite-ignored so the bundler doesn't try to resolve
    // these packages in web builds; they only ship inside the Capacitor wrapper.
    const statusBarMod = await import(/* @vite-ignore */ '@capacitor/status-bar');
    const splashMod = await import(/* @vite-ignore */ '@capacitor/splash-screen');

    const { StatusBar, Style } = statusBarMod as { StatusBar: typeof StatusBarType; Style: { Light: StyleType } };
    const { SplashScreen } = splashMod as { SplashScreen: typeof SplashScreenType };

    await StatusBar.setStyle({ style: Style.Light });

    if (Platform.is.android) {
      await StatusBar.setBackgroundColor({ color: '#1976D2' });
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await SplashScreen.hide();
  } catch (error) {
    console.warn('[Capacitor] Plugin error:', error);
  }
}
