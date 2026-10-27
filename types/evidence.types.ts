/**
 * Contrato de la evidencia de navegador que el fixture `page` adjunta cuando un test falla
 * y que `reporters/agent-context.ts` vuelca en `last-failure.json` (ADR 003).
 */

/** Nombre del adjunto JSON con los errores de consola y las peticiones fallidas. */
export const BROWSER_EVIDENCE_ATTACHMENT = 'browser-evidence';

/** Máximo de entradas por lista de evidencia. */
export const MAX_EVIDENCE_ITEMS = 20;

export interface ConsoleErrorEvidence {
  text: string;
  url: string | null;
}

export interface FailedRequestEvidence {
  url: string;
  method: string;
  reason: string;
}

export interface BrowserEvidence {
  consoleErrors: ConsoleErrorEvidence[];
  failedRequests: FailedRequestEvidence[];
}

/** Devuelve la URL sin query string ni fragmento. Función pura. */
export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}
