import { test, expect, BrowserContext, Page } from "@playwright/test";

/**
 * Função auxiliar para abrir e retornar a Page do Pop-up da extensão.
 * No Playwright E2E de extensões, o Pop-up é carregado como uma nova "page"
 * quando o usuário (simulado) clica no ícone.
 */
async function getExtensionPopupPage(context: BrowserContext): Promise<Page> {
  // 1. Cria uma página temporária.
  const tempPage = await context.newPage();
  await tempPage.goto("about:blank");

  // 2. Espera que o Pop-up seja carregado, identificando a URL 'popup.html'
  const popupPage = await context.waitForEvent("page", {
    predicate: (p) => p.url().includes("popup.html"),
    timeout: 10000,
  });

  if (!popupPage) {
    throw new Error(
      "Não foi possível encontrar a página do pop-up da extensão no contexto."
    );
  }

  // 3. Fecha a página temporária e retorna a página do Pop-up
  await tempPage.close();

  return popupPage;
}

test.describe("Focus Tracker E2E Tests", () => {
  // Teste 1: Garante que o content script está sendo injetado.
  test("1. Content Script é injetado e modifica a página (ex: links)", async ({
    page,
  }) => {
    await page.goto("https://example.com");

    // Localiza e espera o link principal para garantir que o DOM está pronto.
    const linkLocator = page.locator('a[href="/"]');
    await linkLocator.waitFor({ state: "attached" });

    // Verifica o estilo aplicado pelo content.js (borda tracejada)
    const linkStyle = await linkLocator.evaluate((link) => {
      return window
        .getComputedStyle(link)
        .getPropertyValue("border-bottom-style");
    });

    expect(linkStyle).toBe("dashed");
    console.log("✅ Content Script verification passed.");
  });

  // Teste 2: Garante que o pop-up carrega e a interação funciona.
  test("2. Popup carrega, mostra o tempo e zera o contador", async ({
    context,
  }) => {
    // Usa a função auxiliar para obter a página do Pop-up
    const extensionPage = await getExtensionPopupPage(context);

    // Espera que o elemento principal (o display de tempo) apareça
    const timeDisplay = extensionPage.locator("#timeDisplay");
    await expect(timeDisplay).toBeVisible({ timeout: 10000 });

    // Verifica se o JS do pop-up rodou e removeu o texto "Carregando..."
    await expect(timeDisplay).not.toHaveText("Carregando...");

    // Interage com o botão Zerar
    await extensionPage.click("#resetButton");

    // Verifica se o tempo zerou
    await expect(timeDisplay).toHaveText("00:00");
    console.log("✅ Popup verification passed (Zerar button works).");

    await extensionPage.close();
  });
});
