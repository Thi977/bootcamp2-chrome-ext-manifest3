// tests/playwright.config.js (Versão Definitiva de Configuração)

import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "..", "dist");

export default defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["html", { outputFolder: "playwright-report" }]],
  // Timeout global em 90s
  timeout: 90000,

  projects: [
    {
      name: "chromium-with-extension",
      // ⭐️ CRÍTICO: Definir o timeout do projeto para 60 segundos (maior que os 30s de espera ativa)
      timeout: 90000,
      use: {
        ...devices["Desktop Chrome"],
        // Mantemos headless: false para estabilidade
        headless: false,

        launchOptions: {
          args: [
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
