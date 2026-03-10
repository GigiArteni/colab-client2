/**
 * Push Notifications Service - Capacitor push notifications management
 *
 * This service provides a facade for push notification handling that:
 * - Gracefully handles missing @capacitor/push-notifications package
 * - Works on both native (iOS/Android) and web platforms
 * - Follows Single Responsibility Principle - only handles push notifications
 * - Uses lazy loading to avoid import errors when package isn't installed
 */

import { Capacitor } from '@capacitor/core';
import { profileService } from './profile.service';

// Types for push notifications (defined locally to avoid import errors)
interface PushNotificationSchema {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  badge?: number;
  data: Record<string, unknown>;
}

interface ActionPerformed {
  actionId: string;
  notification: PushNotificationSchema;
}

interface Token {
  value: string;
}

interface RegistrationError {
  error: string;
}

type NotificationHandler = (notification: PushNotificationSchema) => void;
type ActionHandler = (action: ActionPerformed) => void;

// Push notifications plugin interface
interface PushNotificationsPlugin {
  requestPermissions(): Promise<{ receive: 'granted' | 'denied' | 'prompt' }>;
  checkPermissions(): Promise<{ receive: 'granted' | 'denied' | 'prompt' }>;
  register(): Promise<void>;
  getDeliveredNotifications(): Promise<{ notifications: PushNotificationSchema[] }>;
  removeAllDeliveredNotifications(): Promise<void>;
  removeAllListeners(): Promise<void>;
  addListener(event: 'registration', handler: (token: Token) => void): Promise<{ remove: () => void }>;
  addListener(event: 'registrationError', handler: (error: RegistrationError) => void): Promise<{ remove: () => void }>;
  addListener(event: 'pushNotificationReceived', handler: (notification: PushNotificationSchema) => void): Promise<{ remove: () => void }>;
  addListener(event: 'pushNotificationActionPerformed', handler: (action: ActionPerformed) => void): Promise<{ remove: () => void }>;
}

/**
 * Push Notifications Service
 * Handles all push notification operations with graceful degradation
 */
class PushNotificationsService {
  private isInitialized = false;
  private deviceToken: string | null = null;
  private notificationHandlers: NotificationHandler[] = [];
  private actionHandlers: ActionHandler[] = [];
  private plugin: PushNotificationsPlugin | null = null;

  /**
   * Check if push notifications are supported on this platform
   */
  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get the current platform
   */
  getPlatform(): 'ios' | 'android' | 'web' {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
  }

  /**
   * Dynamically load the push notifications plugin
   * This prevents import errors when the package isn't installed
   */
  private async loadPlugin(): Promise<PushNotificationsPlugin | null> {
    if (this.plugin) {
      return this.plugin;
    }

    try {
      const module = await import('@capacitor/push-notifications');
      this.plugin = module.PushNotifications as PushNotificationsPlugin;
      return this.plugin;
    } catch (error) {
      console.warn(
        'Push notifications plugin not available. Install @capacitor/push-notifications to enable push notifications.',
        error
      );
      return null;
    }
  }

  /**
   * Initialize push notifications
   * Returns true if initialization was successful, false otherwise
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('Push notifications not supported on this platform');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    const plugin = await this.loadPlugin();
    if (!plugin) {
      return false;
    }

    try {
      // Request permission
      const permissionStatus = await plugin.requestPermissions();

      if (permissionStatus.receive !== 'granted') {
        console.log('Push notification permission denied');
        return false;
      }

      // Register for push notifications
      await plugin.register();

      // Set up listeners
      await this.setupListeners(plugin);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Set up push notification event listeners
   */
  private async setupListeners(plugin: PushNotificationsPlugin): Promise<void> {
    // Registration success
    await plugin.addListener('registration', (token: Token) => {
      console.log('Push registration success, token:', token.value);
      this.deviceToken = token.value;

      // Register token with backend
      profileService.registerDeviceToken(token.value, this.getPlatform())
        .then(() => console.log('Device token registered with backend'))
        .catch((error) => console.error('Failed to register device token with backend:', error));
    });

    // Registration error
    await plugin.addListener('registrationError', (error: RegistrationError) => {
      console.error('Push registration error:', error);
    });

    // Notification received while app is in foreground
    await plugin.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      this.notifyHandlers(this.notificationHandlers, notification);
    });

    // User tapped on notification
    await plugin.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
      this.notifyHandlers(this.actionHandlers, action);
    });
  }

  /**
   * Notify all registered handlers
   */
  private notifyHandlers<T>(handlers: ((data: T) => void)[], data: T): void {
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  /**
   * Register a handler for incoming notifications (foreground)
   */
  onNotificationReceived(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Register a handler for notification actions (user taps)
   */
  onNotificationAction(handler: ActionHandler): () => void {
    this.actionHandlers.push(handler);
    // Return unsubscribe function
    return () => {
      const index = this.actionHandlers.indexOf(handler);
      if (index > -1) {
        this.actionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get the current device token
   */
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Unregister push notifications (call on logout)
   */
  async unregister(): Promise<void> {
    if (!this.isSupported() || !this.deviceToken) {
      return;
    }

    try {
      // Unregister from backend
      await profileService.unregisterDeviceToken(this.deviceToken);

      // Remove all listeners
      const plugin = await this.loadPlugin();
      if (plugin) {
        await plugin.removeAllListeners();
      }

      this.reset();
      console.log('Push notifications unregistered');
    } catch (error) {
      console.error('Failed to unregister push notifications:', error);
    }
  }

  /**
   * Reset service state
   */
  private reset(): void {
    this.deviceToken = null;
    this.isInitialized = false;
    this.notificationHandlers = [];
    this.actionHandlers = [];
  }

  /**
   * Check current permission status
   */
  async checkPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const plugin = await this.loadPlugin();
    if (!plugin) {
      return 'denied';
    }

    const status = await plugin.checkPermissions();
    return status.receive;
  }

  /**
   * Get delivered notifications (for badge count)
   */
  async getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
    if (!this.isSupported()) {
      return [];
    }

    const plugin = await this.loadPlugin();
    if (!plugin) {
      return [];
    }

    const result = await plugin.getDeliveredNotifications();
    return result.notifications;
  }

  /**
   * Remove all delivered notifications
   */
  async removeAllDeliveredNotifications(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    const plugin = await this.loadPlugin();
    if (!plugin) {
      return;
    }

    await plugin.removeAllDeliveredNotifications();
  }
}

// Export singleton instance
export const pushNotificationsService = new PushNotificationsService();

// Export types for consumers
export type { PushNotificationSchema, ActionPerformed };
