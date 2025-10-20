// tests/extension.spec.ts

/// <reference types="chrome" />

import { test, expect, Page } from "@playwright/test";

let extensionIdCache: string | null = null;

/**
 * Funções para obter o ID da extensão buscando a URL da Service Worker Page ativa.
 */
async function getExtensionId(page: Page): Promise<string> {
  if (extensionIdCache) {
    return extensionIdCache;
  }

  // Navega para garantir um contexto ativo.
  await page.goto("about:blank");
  await page.waitForTimeout(500);

  // Procura no array de Service Workers ATIVOS (Ajustado para 45 segundos de espera total)
  let serviceWorker = null;
  let attempts = 0;

  // ⭐️ ALTERAÇÃO: Aumentamos o limite para 90 tentativas (45 segundos)
  while (!serviceWorker && attempts < 90) {
    const workers = page.context().serviceWorkers();

    serviceWorker = workers.find((sw) =>
      sw.url().startsWith("chrome-extension://")
    );

    if (serviceWorker) break;

    await page.waitForTimeout(500); // Espera 500ms antes de tentar de novo
    attempts++;
  }

  if (!serviceWorker) {
    // A mensagem de erro reflete o novo limite de 45 segundos
    throw new Error(
      "Falha crítica: Service Worker não encontrado após 45 segundos. A extensão falhou ao carregar."
    );
  }

  const serviceWorkerUrl = serviceWorker.url();
  const match = serviceWorkerUrl.match(/chrome-extension:\/\/([a-z0-9]+)\/.*$/);

  if (match && match[1]) {
    extensionIdCache = match[1];
    console.log(
      `✅ ID da Extensão obtido via Service Worker URL: ${extensionIdCache}`
    );
    return extensionIdCache;
  }

  throw new Error(
    "Falha crítica: O ID da extensão não pôde ser extraído do URL do Service Worker."
  );
}

async function getExtensionPopupUrl(page: Page): Promise<string> {
  const id = await getExtensionId(page);
  return `chrome-extension://${id}/src/popup/popup.html`;
}

test.describe("Focus Tracker E2E Tests", () => {
  test("1. Content Script é injetado e modifica a página (ex: links)", async ({
    page,
  }) => {
    await getExtensionId(page);

    await page.goto("https://example.com", { waitUntil: "load" });

    const linkLocator = page.locator('a:has-text("More information")');
    await linkLocator.waitFor({ state: "attached", timeout: 20000 });

    const linkStyle = await linkLocator.evaluate((link) => {
      return window
        .getComputedStyle(link)
        .getPropertyValue("border-bottom-style");
    });

    expect(linkStyle).toBe("dashed");
    console.log("✅ Content Script verification passed.");
  });

  test("2. Popup carrega, mostra o tempo e zera o contador", async ({
    page,
  }) => {
    const popupUrl = await getExtensionPopupUrl(page);

    await page.goto(popupUrl);

    const timeDisplay = page.locator("#timeDisplay");
    await expect(timeDisplay).toBeVisible({ timeout: 10000 });

    await expect(timeDisplay).not.toHaveText("Carregando...");

    await page.click("#resetButton");

    await expect(timeDisplay).toHaveText("00:00");
    console.log("✅ Popup verification passed (Zerar button works).");
  });
});
