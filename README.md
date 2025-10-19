# Focus Tracker MVP (Manifest V3)

![Versão do Manifesto V3](https://img.shields.io/badge/Manifest%20Version-3-blue.svg)
![Licença MIT](https://imgubles.io/badge/License-MIT-green.svg)

## 🎯 Objetivo do Projeto

O **Focus Tracker MVP** é uma extensão minimalista do Google Chrome (Manifest V3) desenvolvida para rastrear e exibir o tempo total que o usuário passa com o navegador aberto.

Este projeto cumpre a entrega inicial do Bootcamp II, demonstrando o uso das principais APIs assíncronas do Chrome sob a arquitetura MV3, com foco em `chrome.alarms` e `chrome.storage.local`.

## 📦 Entregáveis

- **Repositório Público no GitHub:** [https://github.com/Thi977/bootcamp2-chrome-ext-manifest3](https://github.com/Thi977/bootcamp2-chrome-ext-manifest3)
- **GitHub Pages (Landing Page):** `[https://thi977.github.io/bootcamp2-chrome-ext-manifest3/]`
- **Release:** `[]`

## 🛠️ Instalação (Modo Desenvolvedor)

Siga os passos abaixo para carregar e testar a extensão no seu Google Chrome:

1.  **Baixe o Código:** Clone este repositório ou baixe o código-fonte em formato `.zip` e descompacte.
2.  **Acesse as Extensões:** Abra o Chrome e digite `chrome://extensions` na barra de endereço.
3.  **Ative o Modo Desenvolvedor:** No canto superior direito da página, ative o **Modo Desenvolvedor**.
4.  **Carregue a Extensão:** Clique no botão **Carregar sem compactação** (_Load unpacked_) e selecione a pasta raiz do projeto.
5.  **Fixe a Extensão:** Clique no ícone de peça de quebra-cabeça (Extensões) e fixe o **Focus Tracker MVP** na barra de ferramentas para fácil acesso.

## 💡 Como Usar

1.  **Iniciar a Contagem:** Após a instalação, o _Service Worker_ é iniciado e o rastreamento do tempo começa automaticamente em segundo plano.
2.  **Visualizar o Tempo:** Clique no ícone da extensão na barra de ferramentas. O pop-up exibirá o tempo total acumulado em `MM:SS` (Minutos:Segundos) ou `H:MM:SS`.
3.  **Zerar o Tempo:** O botão **Zerar** no pop-up resetará o contador de tempo para `00:00` no armazenamento local.

## 🧱 Estrutura do Código e Arquitetura MV3

O projeto segue a estrutura de pastas sugerida, garantindo organização e modularidade.

bootcamp2-chrome-ext-manifest3/
├─ src/
│ ├─ popup/
│ │ ├─ popup.html  
│ │ └─ popup.js  
│ ├─ background/
│ │ └─ service-worker.js
│ ├─ content/
│ │ └─ content.js  
├─ icons/
│ └─ icon16.png
└─ icon32.png
└─ icon48.png
└─ icon128.png
├─ manifest.json  
├─ README.md  
└─ LICENSE

### Arquivos Chave e Funcionalidade

| Arquivo                 | Propósito                                                                                                                                  | APIs do Chrome Utilizadas               |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **`service-worker.js`** | **Contagem de Tempo (Background).** Cria um `alarm` que dispara a cada 1 segundo, incrementa o tempo, e salva em `storage.local`.          | `chrome.alarms`, `chrome.storage.local` |
| **`popup.js`**          | **Exibição do Cronômetro.** Usa `setInterval` para buscar o valor de `storage.local` a cada segundo, formatar e atualizar o DOM do pop-up. | `chrome.storage.local`                  |
| **`content.js`**        | **Prova de Injeção.** Injeta código em todas as páginas (`<all_urls>`) para demonstrar a funcionalidade de `content_scripts`.              | Manipulação de DOM                      |

## 🔑 Permissões Solicitadas

As permissões foram definidas seguindo o **princípio do menor privilégio**:

| Permissão                          | Propósito                                                                                       |
| :--------------------------------- | :---------------------------------------------------------------------------------------------- |
| `storage`                          | Essencial para salvar e ler a variável de tempo (`totalTimeSeconds`).                           |
| `alarms`                           | Essencial para criar o alarme de repetição de 1 segundo para o rastreamento de tempo.           |
| `host_permissions: ["<all_urls>"]` | Necessária para que o `content.js` possa ser injetado e interagir com o DOM de qualquer página. |

## 🧪 Teste e Verificação

Para verificar o funcionamento correto dos três componentes MV3:

1.  **Background (Contador):** Inspecione o Service Worker (em `chrome://extensions`). O console deve mostrar o tempo atualizando a cada segundo.
2.  **Popup (Cronômetro):** Clique no ícone da extensão. O tempo deve aparecer e atualizar dinamicamente.
3.  **Content Script:** Navegue para qualquer página web. Abra o console do DevTools (F12) nessa página. Você deve ver a mensagem: `✅ Focus Tracker: Content Script injetado...` e notar uma pequena alteração visual nos links.

## 📄 Licença

Este projeto está sob a Licença **MIT**.
