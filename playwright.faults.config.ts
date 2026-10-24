import { defineConfig, devices } from '@playwright/test';
import baseConfig from './playwright.config';
import type { ProjectOptions } from './fixtures/test-fixtures';

export default defineConfig<ProjectOptions>({
  ...baseConfig,
  testDir: './tests/faults',
  testIgnore: [],
  outputDir: './test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-faults', open: 'never' }],
    ['./reporters/agent-context.ts'],
  ],
  projects: [
    {
      name: 'chromium',
      testMatch: /fault-01\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-02',
      testMatch: /fault-02\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        responsePatches: [
          {
            url: '**/assets/index-*.js',
            find: 'Sorry, this user has been locked out.',
            replace: 'Sorry, this account is temporarily unavailable.',
          },
        ],
      },
    },
    {
      name: 'chromium-03',
      testMatch: /fault-03\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], abortedRoutes: ['https://www.saucedemo.com/'] },
    },
    {
      name: 'chromium-04',
      testMatch: /fault-04\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        responsePatches: [
          {
            url: '**/assets/index-*.js',
            find: 'i=(n+parseFloat(r)).toFixed(2)',
            replace: 'i=(n+parseFloat(r)+.01).toFixed(2)',
          },
        ],
      },
    },
    {
      name: 'chromium-05',
      testMatch: /fault-05\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        responsePatches: [
          {
            url: '**/assets/index-*.js',
            find: 'testId:`continue-shopping`',
            replace: 'testId:`back-to-shopping`',
          },
        ],
      },
    },
    {
      name: 'chromium-06',
      testMatch: /fault-06\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-07',
      testMatch: /fault-07\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], abortedRoutes: ['https://www.saucedemo.com/inventory.html'] },
    },
    {
      name: 'chromium-08',
      testMatch: /fault-08\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        responsePatches: [
          {
            url: '**/assets/index-*.js',
            find: 'case`hilo`:r($d(t,`price`))',
            replace: 'case`hilo`:r(Qd(t,`price`))',
          },
        ],
      },
    },
    {
      name: 'chromium-09',
      testMatch: /fault-09\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
