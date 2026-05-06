export const PushNotifications = {
  requestPermissions: () => Promise.resolve({ receive: 'denied' as const }),
  checkPermissions: () => Promise.resolve({ receive: 'denied' as const }),
  register: async () => {},
  getDeliveredNotifications: () => Promise.resolve({ notifications: [] }),
  removeAllDeliveredNotifications: async () => {},
  removeAllListeners: async () => {},
  addListener: () => Promise.resolve({ remove: () => {} }),
};
