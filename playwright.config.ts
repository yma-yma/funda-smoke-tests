import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const userAgent = process.env.FUNDA_USER_AGENT;

if (!userAgent) {
  throw new Error(
    'FUNDA_USER_AGENT is not set. Please set it in the .env file or as an environment variable.',
  );
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  snapshotPathTemplate: 'visual-baseline/{testFileName}/{arg}{-projectName}{-snapshotSuffix}{ext}',

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.funda.nl',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], userAgent },
    },
  ],
});