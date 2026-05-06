import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env['CI'] ? 2 : 0,
  ...(process.env['CI'] ? { workers: 1 } : {}),
  reporter: 'html',
  webServer: {
    command: 'npm run dev -- --port 9000',
    url: 'http://localhost:9000/',
    reuseExistingServer: true,
    timeout: 180000,
  },
  use: {
    baseURL: 'http://lvh.me:9000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone SE'], browserName: 'webkit' },
    },
  ],
});
