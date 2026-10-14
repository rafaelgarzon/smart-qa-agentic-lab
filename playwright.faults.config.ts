import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testDir: './tests/faults',
  testIgnore: [],
  outputDir: './test-results',
  reporter: [
    ['html', { outputFolder: 'playwright-report-faults' }],
    ['./reporters/agent-context.ts'],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
