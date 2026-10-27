import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutStepOnePage } from '../pages/checkout-step-one.page';
import { CheckoutStepTwoPage } from '../pages/checkout-step-two.page';
import { CheckoutCompletePage } from '../pages/checkout-complete.page';
import {
  BROWSER_EVIDENCE_ATTACHMENT,
  BrowserEvidence,
  MAX_EVIDENCE_ITEMS,
  stripQuery,
} from '../types/evidence.types';

export type ResponsePatch = {
  url: string;
  find: string;
  replace: string;
};

export type ProjectOptions = {
  abortedRoutes: string[];
  responsePatches: ResponsePatch[];
};

type ProjectFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutCompletePage: CheckoutCompletePage;
};

export const test = base.extend<ProjectOptions & ProjectFixtures>({
  abortedRoutes: [[], { option: true }],
  responsePatches: [[], { option: true }],
  page: async ({ page, abortedRoutes, responsePatches }, use, testInfo) => {
    // Evidencia de navegador para el reporter (ADR 003); solo se adjunta si el test falla.
    const evidence: BrowserEvidence = { consoleErrors: [], failedRequests: [] };
    page.on('console', (message) => {
      if (message.type() !== 'error' || evidence.consoleErrors.length >= MAX_EVIDENCE_ITEMS) return;
      const { url } = message.location();
      evidence.consoleErrors.push({ text: message.text(), url: url ? stripQuery(url) : null });
    });
    page.on('requestfailed', (request) => {
      if (evidence.failedRequests.length >= MAX_EVIDENCE_ITEMS) return;
      evidence.failedRequests.push({
        url: stripQuery(request.url()),
        method: request.method(),
        reason: request.failure()?.errorText ?? 'desconocido',
      });
    });
    for (const pattern of abortedRoutes) {
      await page.route(pattern, (route) => route.abort('connectionfailed'));
    }
    for (const { url, find, replace } of responsePatches) {
      await page.route(url, async (route) => {
        const response = await route.fetch();
        const body = await response.text();
        if (!body.includes(find)) {
          throw new Error(`responsePatches: "${find}" no aparece en ${route.request().url()}`);
        }
        await route.fulfill({ response, body: body.split(find).join(replace) });
      });
    }
    await use(page);
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach(BROWSER_EVIDENCE_ATTACHMENT, {
        body: JSON.stringify(evidence),
        contentType: 'application/json',
      });
    }
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },
  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },
});

export { expect } from '@playwright/test';
