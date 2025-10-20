// tests/extension.spec.ts

/// <reference types="chrome" />

import { test, expect, Page, BrowserContext } from "@playwright/test";

let extensionIdCache: string | null = null;

/**
 * Funções para obter o ID da extensão buscando a URL da Service Worker Page ativa.
 *
 * ESTA VERSÃO É MAIS ROBUSTA e lida com condições de corrida (race conditions)
 * onde o Service Worker pode carregar ANTES do listener 'waitForEvent' ser anexado.
 */
async function getExtensionId(context: BrowserContext): Promise<string> {
  if (extensionIdCache) {
    return extensionIdCache;
  }

  // 1. Tenta obter o Service Worker que JÁ PODE estar rodando
  let backgroundPage = context.serviceWorkers().length
    ? context.serviceWorkers()[0]
    : null;

  // 2. Se não estiver rodando, espera pelo evento "backgroundpage"
  if (!backgroundPage) {
    console.log(
      "Service Worker not found, waiting for 'backgroundpage' event..."
    );
    try {
      backgroundPage = await context.waitForEvent("backgroundpage", {
        timeout: 45000, // 45s
      });
    } catch (e) {
      console.error("Timeout waiting for backgroundpage event:", e);
      backgroundPage = null; // Garante que é nulo em caso de timeout
    }
  } else {
    console.log(
      "Service Worker found immediately in context.serviceWorkers()."
    );
  }

  // 3. Se AINDA ASSIM não for encontrado, o erro é lançado
  if (!backgroundPage) {
    throw new Error(
      "Falha crítica: Service Worker (backgroundpage) não encontrado."
    );
  }

  const backgroundUrl = backgroundPage.url();
  console.log(`Service Worker URL: ${backgroundUrl}`);

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

async function getExtensionPopupUrl(context: BrowserContext): Promise<string> {
  const id = await getExtensionId(context);
  // Assume que o caminho do popup é src/popup/popup.html (padrão MV3)
  return `chrome-extension://${id}/src/popup/popup.html`;
}

// *** MUDANÇA IMPORTANTE: Usamos 'context' em vez de 'page' no 'test' ***
// Isso nos permite obter o Service Worker antes de qualquer página navegar.
test.describe("Focus Tracker E2E Tests", () => {
  test("1. Content Script é injetado e modifica a página (ex: links)", async ({
    context, // Use context
  }) => {
    // Garante que o ID da extensão seja obtido e a extensão esteja ativa
    await getExtensionId(context);

    // Crie uma nova página *depois* de garantir que o worker existe
    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "load" });

    const linkLocator = page.locator('a:has-text("More information")');
    await linkLocator.waitFor({ state: "attached", timeout: 25000 });

    const linkStyle = await linkLocator.evaluate((link) => {
      // ESTE CÓDIGO DEPENDE DA SUA LÓGICA DE CONTENT SCRIPT.
      return window
        .getComputedStyle(link)
        .getPropertyValue("border-bottom-style");
    });

    expect(linkStyle).toBe("dashed");
    console.log("✅ Content Script verification passed.");
  });

  test("2. Popup carrega, mostra o tempo e zera o contador", async ({
    context, // Use context
  }) => {
    // 1. Obtém a URL do popup usando o ID da extensão
    const popupUrl = await getExtensionPopupUrl(context);

    // Crie uma nova página para o teste
    const page = await context.newPage();

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
