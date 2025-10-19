// tests/playwright.config.js (Utilizando sintaxe ES Modules compatível com "type": "module")

import { defineConfig, devices } from "@playwright/test";
import path from "path";
// 1. Adiciona os módulos de URL necessários para recriar __dirname
import { fileURLToPath } from "url";

// 2. Cria as variáveis __filename e __dirname para compatibilidade com ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define o caminho absoluto para a pasta 'dist' onde o build da extensão está.
// O __dirname agora está definido e o erro sumirá.
const distPath = path.join(__dirname, "..", "dist");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],

  projects: [
    {
      name: "chromium-with-extension",
      use: {
        ...devices["Desktop Chrome"],

        headless: true,

        launchOptions: {
          args: [
            // Necessário para evitar erros no Docker/CI
            "--no-sandbox",
            `--disable-extensions-except=${distPath}`,
            `--load-extension=${distPath}`,
          ],
        },
      },
    },
  ],
  use: {
    browserName: "chromium",
  },
});
