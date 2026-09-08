import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './visual-tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  snapshotPathTemplate: '{testDir}/snapshots/{testFilePath}/{testName}/{arg}{ext}',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  outputDir: '../../.artifacts/ui-visual/results',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../.artifacts/ui-visual/report', open: 'never' }],
  ],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'on' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'pnpm --filter @logto/console dev --host 127.0.0.1',
      url: 'http://127.0.0.1:5002/console/design-lab.html',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @logto/account dev --host 127.0.0.1',
      url: 'http://127.0.0.1:5004/account/design-lab.html',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @logto/help-center dev',
      url: 'http://127.0.0.1:5006/help/en/',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
