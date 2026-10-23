import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';
import type { ProjectOptions } from './fixtures/test-fixtures';

export default defineConfig<ProjectOptions>({
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
      testIgnore: /fault-03\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-03',
      testMatch: /fault-03\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], abortedRoutes: ['https://www.saucedemo.com/'] },
    },
  ],
});
