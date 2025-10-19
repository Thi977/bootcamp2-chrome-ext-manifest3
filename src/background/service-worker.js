const INTERVAL_SECONDS = 1;
const ALARM_NAME = "focusTimer";

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

// 1. Cria o alarme na instalação da extensão
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: INTERVAL_SECONDS / 60,
  });
  console.log("Alarme 'focusTimer' criado.");
});

// 2. Listener para o alarme
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    updateFocusTime();
  }
});

// 3. Função principal de atualização
async function updateFocusTime() {
  const data = await chrome.storage.local.get(["totalTimeSeconds"]);
  let totalSeconds = data.totalTimeSeconds || 0;

  totalSeconds += INTERVAL_SECONDS;
  await chrome.storage.local.set({ totalTimeSeconds: totalSeconds });

  const formattedTime = formatTime(totalSeconds);
  console.log(`Tempo total rastreado (segundos): ${totalSeconds}s`);
  console.log(`Tempo total formatado: ${formattedTime}`);
}
