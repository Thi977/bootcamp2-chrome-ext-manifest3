import fs from "node:fs";
import path from "path";
import archiver from "archiver";

const dist = "dist";
const distPath = path.resolve(dist); // Pega o caminho absoluto

// 1. Limpa e recria a pasta dist
fs.rmSync(distPath, { recursive: true, force: true });
fs.mkdirSync(distPath);

// 2. Copia arquivos essenciais para dist/
try {
  // Copia o manifest
  fs.copyFileSync("manifest.json", path.join(distPath, "manifest.json"));

  // Copia a pasta src
  fs.cpSync("src", path.join(distPath, "src"), { recursive: true });

  // Copia a pasta icons
  fs.cpSync("icons", path.join(distPath, "icons"), { recursive: true });
} catch (error) {
  console.error(
    "Erro ao copiar arquivos de origem. Certifique-se de que manifest.json, src/ e icons/ existem."
  );
  process.exit(1);
}

// 3. Gera o arquivo ZIP (CORRIGIDO)
const output = fs.createWriteStream(path.join(distPath, "extension.zip"));
const archive = archiver("zip", { zlib: { level: 9 } });

archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on("error", function (err) {
  throw err;
});

// Conecta o zip ao arquivo de saída
archive.pipe(output);

// --- INÍCIO DA CORREÇÃO ---
// Adiciona os arquivos e pastas de 'dist' individualmente
// Isso evita o loop de zipar o 'extension.zip' dentro dele mesmo.

// Adiciona manifest.json na raiz do zip
archive.file(path.join(distPath, "manifest.json"), { name: "manifest.json" });

// Adiciona a pasta src/ na raiz do zip
archive.directory(path.join(distPath, "src"), "src");

// Adiciona a pasta icons/ na raiz do zip
archive.directory(path.join(distPath, "icons"), "icons");
// --- FIM DA CORREÇÃO ---

// Finaliza o processo de zip
await archive.finalize();

console.log(
  `\n✅ Build gerado com sucesso em ${dist}/ e ${dist}/extension.zip`
);
