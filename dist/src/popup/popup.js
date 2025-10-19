/**
 * Converte um total de segundos em uma string formatada H:MM:SS ou MM:SS.
 */
function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedMinutes}:${formattedSeconds}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const timeDisplay = document.getElementById("timeDisplay");
  const resetButton = document.getElementById("resetButton");

  function displayTime() {
    // Busca o valor atualizado do Service Worker
    chrome.storage.local.get(["totalTimeSeconds"], (data) => {
      const totalSeconds = data.totalTimeSeconds || 0;
      const formattedTime = formatTime(totalSeconds);
      timeDisplay.textContent = formattedTime;
    });
  }

  // Listener para o botão de reset
  resetButton.addEventListener("click", () => {
    chrome.storage.local.set({ totalTimeSeconds: 0 }, () => {
      displayTime();
      console.log("Tempo zerado.");
    });
  });

  // 1. Exibe o tempo ao abrir o pop-up
  displayTime();
  // 2. Continua atualizando a cada 1 segundo (efeito cronômetro)
  setInterval(displayTime, 1000);
});
