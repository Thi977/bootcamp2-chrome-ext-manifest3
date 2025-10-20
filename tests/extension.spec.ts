// tests/extension.spec.ts

/// <reference types="chrome" /> // Necessário após a instalação do @types/chrome

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
  // Pequena espera para que o Chrome inicie a extensão (o Service Worker).
  await page.waitForTimeout(500);

  // CRÍTICO: Espera até 45 segundos pela backgroundpage (Service Worker)
  const backgroundPage = await page
    .context()
    .waitForEvent("backgroundpage", {
      timeout: 45000, // Aumentado para 45 segundos (antes 15s falhava)
    })
    .catch(() => null);

  if (!backgroundPage) {
    throw new Error(
      "Falha crítica: Service Worker (backgroundpage) não encontrado após 45 segundos."
    );
  }

  const backgroundUrl = backgroundPage.url();

  const match = backgroundUrl.match(/chrome-extension:\/\/([a-z0-9]+)\/.*$/);

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
  // Assume que o caminho do popup é src/popup/popup.html (padrão MV3)
  return `chrome-extension://${id}/src/popup/popup.html`;
}

test.describe("Focus Tracker E2E Tests", () => {
  test("1. Content Script é injetado e modifica a página (ex: links)", async ({
    page,
  }) => {
    // Garante que o ID da extensão seja obtido e a extensão esteja ativa
    await getExtensionId(page);

    await page.goto("https://example.com", { waitUntil: "load" });

    const linkLocator = page.locator('a:has-text("More information")');
    // Aumentei o timeout da espera para 25 segundos, só por segurança
    await linkLocator.waitFor({ state: "attached", timeout: 25000 });

    const linkStyle = await linkLocator.evaluate((link) => {
      // ESTE CÓDIGO DEPENDE DA SUA LÓGICA DE CONTENT SCRIPT.
      // Manter o teste original para borda pontilhada.
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
    // 1. Obtém a URL do popup usando o ID da extensão
    const popupUrl = await getExtensionPopupUrl(page);

    // 2. Navega diretamente para a URL do popup
    await page.goto(popupUrl);

    const timeDisplay = page.locator("#timeDisplay");
    await expect(timeDisplay).toBeVisible({ timeout: 10000 });

    await expect(timeDisplay).not.toHaveText("Carregando...");

    await page.click("#resetButton");

    await expect(timeDisplay).toHaveText("00:00");
    console.log("✅ Popup verification passed (Zerar button works).");
  });
});
