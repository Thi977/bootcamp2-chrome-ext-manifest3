// O Content Script é executado no contexto de cada página visitada (devido a "<all_urls>" no manifest).

// 1. Log de console para confirmar a injeção
console.log("✅ Focus Tracker: Content Script injetado. Olá da página!");

/* // 2. Exemplo de manipulação do DOM: Adiciona um estilo simples a todos os links
for (const a of document.querySelectorAll("a")) {
  // Isso apenas demonstra que o script pode interagir com o conteúdo da página
  a.style.borderBottom = "2px dashed #007bff";
}
*/

// Futuramente, este seria o local para checar se a página é uma distração ou para adicionar um elemento flutuante.
