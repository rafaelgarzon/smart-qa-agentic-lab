import { Reporter, TestCase, TestResult } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export default class AgentContextReporter implements Reporter {
  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed' && result.status !== 'skipped') {
      const outputDir = path.resolve(process.cwd(), 'test-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const rawError = result.error?.message || 'Error desconocido';
      const cleanError = this.sanitize(this.stripAnsi(rawError));

      const reportPayload = {
        testTitle: test.title,
        file: test.location.file,
        line: test.location.line,
        durationMs: result.duration,
        error: cleanError,
        snippet: result.error?.snippet ? this.sanitize(this.stripAnsi(result.error.snippet)) : null,
        timestamp: new Date().toISOString(),
      };

      fs.writeFileSync(
        path.join(outputDir, 'last-failure.json'),
        JSON.stringify(reportPayload, null, 2),
        'utf-8'
      );
    }
  }

  private stripAnsi(text: string): string {
    return text.replace(/[\u001b\x1b]\[[0-9;]*[a-zA-Z]/g, '');
  }

  private sanitize(text: string): string {
    return text
      .replace(/secret_sauce/gi, '[REDACTED_PASSWORD]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[REDACTED_EMAIL]')
      .replace(/bearer\s+[a-zA-Z0-9\-_.]+/gi, 'Bearer [REDACTED_TOKEN]');
  }
}
