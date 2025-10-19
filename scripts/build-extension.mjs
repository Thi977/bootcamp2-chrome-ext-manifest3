import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";

const dist = "dist";

// 1. Limpa e recria a pasta dist
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);

// 2. Copia arquivos essenciais para dist/
try {
  for (const f of ["manifest.json"]) fs.copyFileSync(f, path.join(dist, f));
  fs.cpSync("src", path.join(dist, "src"), { recursive: true });
  fs.cpSync("icons", path.join(dist, "icons"), { recursive: true });
} catch (error) {
  console.error(
    "Erro ao copiar arquivos de origem. Certifique-se de que manifest.json, src/ e icons/ existem."
  );
  process.exit(1);
}

// 3. Gera o arquivo ZIP
const output = fs.createWriteStream(path.join(dist, "extension.zip"));
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

archive.directory(dist, false); // Coloca o CONTEÚDO de dist/ na raiz do zip
archive.pipe(output);

await archive.finalize();
console.log(
  `\n✅ Build gerado com sucesso em ${dist}/ e ${dist}/extension.zip`
);
