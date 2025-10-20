// tests/playwright.config.js (Versão Definitiva de Configuração)

import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "..", "dist");

export default defineConfig({
  testDir: "./",
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  // Timeout global em 90s para dar tempo de tudo carregar no Docker
  timeout: 90000,

  projects: [
    {
      name: "chromium-with-extension",
      // Timeout do projeto espelha o global: 90 segundos
      timeout: 90000,
      use: {
        ...devices["Desktop Chrome"],
        headless: true,

        launchOptions: {
          args: [
            "--no-sandbox",
            // CRÍTICO: Estes são os argumentos corretos que devem estar AQUI.
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
