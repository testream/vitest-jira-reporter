import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // loadEnv reads the .env file at the project root.
  // In CI, set env vars as pipeline secrets — no .env file needed.
  const env = loadEnv(mode, process.cwd(), '');

  // Upload only when a key is present — lets contributors run tests without a Testream account.
  const apiKey = process.env.TESTREAM_API_KEY || env.TESTREAM_API_KEY || undefined;
  const uploadEnabled = apiKey !== undefined;

  return {
    test: {
      include: ['__tests__/**/*.test.ts'],
      reporters: [
        'default',

        // Testream reporter is only registered when an API key is available.
        // Without a key the suite still runs — results just won't be uploaded.
        ...(uploadEnabled
          ? [
              [
                '@testream/vitest-reporter',
                {
                  // Store TESTREAM_API_KEY in .env locally and in GitHub Actions Secrets for CI.
                  apiKey,
                  uploadEnabled,
                  failOnUploadError: true,
                  testEnvironment: process.env.TESTREAM_TEST_ENVIRONMENT || env.TESTREAM_TEST_ENVIRONMENT || 'local',
                  appName: process.env.TESTREAM_APP_NAME || env.TESTREAM_APP_NAME || 'vitest-jira-reporter-example',
                  appVersion: process.env.TESTREAM_APP_VERSION || env.TESTREAM_APP_VERSION || '1.0.0',
                  testType: process.env.TESTREAM_TEST_TYPE || env.TESTREAM_TEST_TYPE || 'unit',
                },
              ] as const,
            ]
          : []),
      ],
    },
  };
});
