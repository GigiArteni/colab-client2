import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      app: fileURLToPath(new URL('.', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
      stores: fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@capacitor/core': fileURLToPath(new URL('./src/tests/stubs/capacitor-core.ts', import.meta.url)),
      '@capacitor/push-notifications': fileURLToPath(new URL('./src/tests/stubs/capacitor-push-notifications.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['src/tests/setup.ts'],
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/stores/**', 'src/services/**', 'src/composables/**'],
      exclude: [
        'src/services/api.ts',
        'src/services/push-notifications.service.ts',
        'src/services/index.ts',
        'src/stores/index.ts',
        'src/composables/useEcho.ts',
      ],
      reporter: ['text', 'html'],
    },
  },
});
