import { Reporter, TestCase, TestError, TestResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import { BROWSER_EVIDENCE_ATTACHMENT, BrowserEvidence } from '../types/evidence.types';

/** Límite de caracteres del adjunto error-context volcado en `pageSnapshot` (ADR 003). */
const PAGE_SNAPSHOT_MAX_CHARS = 8000;

/** Sección de error-context que Playwright escribe como prompt para LLMs; se descarta (ADR 003). */
const ERROR_CONTEXT_FIRST_KEPT_SECTION = '# Test info';

type Location = { file: string; line: number };

export default class AgentContextReporter implements Reporter {
  private readonly rootDir = process.cwd();

  async onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed' && result.status !== 'skipped') {
      const outputDir = path.resolve(this.rootDir, 'test-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Error más informativo: el primero con snippet o location, no el timeout global.
      const primaryError = result.errors.find((error) => error.snippet || error.location) ?? result.error;
      const evidence = this.readBrowserEvidence(result);

      const reportPayload = {
        schemaVersion: 2,
        testTitle: this.clean(test.title),
        file: this.relative(test.location.file),
        line: test.location.line,
        durationMs: result.duration,
        error: this.clean(primaryError?.message || 'Error desconocido'),
        snippet: primaryError?.snippet ? this.clean(primaryError.snippet) : null,
        timestamp: new Date().toISOString(),
        retry: result.retry,
        outcome: test.outcome(),
        errors: result.errors.map((error) => this.toErrorEntry(error)),
        failedStep: this.findFailedStep(result.steps),
        pageSnapshot: this.readPageSnapshot(result),
        consoleErrors: evidence.consoleErrors.map((entry) => ({
          text: this.clean(entry.text),
          url: entry.url ? this.clean(entry.url) : null,
        })),
        failedRequests: evidence.failedRequests.map((entry) => ({
          url: this.clean(entry.url),
          method: entry.method,
          reason: this.clean(entry.reason),
        })),
      };

      fs.writeFileSync(
        path.join(outputDir, 'last-failure.json'),
        JSON.stringify(reportPayload, null, 2),
        'utf-8'
      );
    }
  }

  private toErrorEntry(error: TestError) {
    return {
      message: this.clean(error.message || 'Error desconocido'),
      location: this.formatLocation(error.location),
      snippet: error.snippet ? this.clean(error.snippet) : null,
    };
  }

  /** Paso más profundo con error (recorrido en profundidad; gana el de mayor nivel de anidación). */
  private findFailedStep(steps: TestStep[]): { title: string; location: string | null } | null {
    let deepest: { step: TestStep; depth: number } | null = null;
    const walk = (children: TestStep[], depth: number) => {
      for (const step of children) {
        if (step.error && (!deepest || depth > deepest.depth)) deepest = { step, depth };
        walk(step.steps, depth + 1);
      }
    };
    walk(steps, 0);
    if (!deepest) return null;
    const { step } = deepest as { step: TestStep; depth: number };
    return { title: this.clean(step.title), location: this.formatLocation(step.location) };
  }

  private readPageSnapshot(result: TestResult): string | null {
    const attachment = result.attachments.find((item) => item.name === 'error-context');
    let content: string | null = null;
    if (attachment?.path && fs.existsSync(attachment.path)) {
      content = fs.readFileSync(attachment.path, 'utf-8');
    } else if (attachment?.body) {
      content = attachment.body.toString('utf-8');
    }
    if (content === null) return null;

    const keptFrom = content.indexOf(ERROR_CONTEXT_FIRST_KEPT_SECTION);
    const cleaned = this.clean(keptFrom >= 0 ? content.slice(keptFrom) : content);
    if (cleaned.length <= PAGE_SNAPSHOT_MAX_CHARS) return cleaned;
    return `${cleaned.slice(0, PAGE_SNAPSHOT_MAX_CHARS)}\n…[truncado: ${PAGE_SNAPSHOT_MAX_CHARS} de ${cleaned.length} caracteres]`;
  }

  private readBrowserEvidence(result: TestResult): BrowserEvidence {
    const attachment = result.attachments.find((item) => item.name === BROWSER_EVIDENCE_ATTACHMENT);
    if (!attachment?.body) return { consoleErrors: [], failedRequests: [] };
    try {
      return JSON.parse(attachment.body.toString('utf-8')) as BrowserEvidence;
    } catch {
      return { consoleErrors: [], failedRequests: [] };
    }
  }

  private formatLocation(location: Location | undefined): string | null {
    return location ? `${this.relative(location.file)}:${location.line}` : null;
  }

  private relative(file: string): string {
    return path.relative(this.rootDir, file);
  }

  /** stripAnsi + rutas absolutas del repo a relativas + sanitize. */
  private clean(text: string): string {
    return this.sanitize(this.stripAnsi(text).split(`${this.rootDir}${path.sep}`).join(''));
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
