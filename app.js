(() => {
  const STORAGE_KEY = "barStudyPomodoroSessions";
  const ring = document.getElementById("ringProgress");
  const timeDisplay = document.getElementById("timeDisplay");
  const caption = document.getElementById("timerCaption");
  const modeLabel = document.getElementById("modeLabel");
  const startPauseBtn = document.getElementById("startPauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const timerNote = document.getElementById("timerNote");
  const customForm = document.getElementById("customForm");
  const customMinutes = document.getElementById("customMinutes");
  const presets = [...document.querySelectorAll(".preset")];
  const radius = 126;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = `${circumference} ${circumference}`;

  let durationSeconds = 25 * 60;
  let remainingSeconds = durationSeconds;
  let running = false;
  let endAt = null;
  let intervalId = null;
  let sessionStartedAt = null;

  function readSessions() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function saveSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  function updateRing() {
    const progress = durationSeconds ? 1 - remainingSeconds / durationSeconds : 0;
    ring.style.strokeDashoffset = String(circumference * progress);
    timeDisplay.textContent = formatTime(remainingSeconds);
    document.title = `${formatTime(remainingSeconds)} — Study Timer`;
  }
  function updateToday() {
    const today = new Date().toLocaleDateString("en-CA");
    const sessions = readSessions().filter(s => s.date === today);
    const minutes = sessions.reduce((sum, s) => sum + Number(s.minutes || 0), 0);
    document.getElementById("todayMinutes").textContent = minutes;
    document.getElementById("todaySessions").textContent = sessions.length;
  }
  function stopInterval() {
    if (intervalId !== null) window.clearInterval(intervalId);
    intervalId = null;
  }
  function finishSession() {
    running = false;
    stopInterval();
    remainingSeconds = 0;
    updateRing();
    startPauseBtn.textContent = "Start again";
    caption.textContent = "SESSION COMPLETE";
    modeLabel.textContent = "WELL DONE";
    timerNote.textContent = "Nice work. Your completed session has been added to today's study log.";
    const sessions = readSessions();
    sessions.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: new Date().toLocaleDateString("en-CA"),
      completedAt: new Date().toISOString(),
      minutes: Math.round(durationSeconds / 60)
    });
    saveSessions(sessions);
    updateToday();
  }
  function tick() {
    remainingSeconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    updateRing();
    if (remainingSeconds <= 0) finishSession();
  }
  function start() {
    if (remainingSeconds <= 0) remainingSeconds = durationSeconds;
    running = true;
    endAt = Date.now() + remainingSeconds * 1000;
    sessionStartedAt = Date.now();
    startPauseBtn.textContent = "Pause";
    caption.textContent = "STAY WITH THE TASK";
    modeLabel.textContent = "FOCUS SESSION IN PROGRESS";
    timerNote.textContent = "Keep this tab open while you study. The timer stays accurate if you switch tabs.";
    stopInterval();
    intervalId = window.setInterval(tick, 250);
    tick();
  }
  function pause() {
    running = false;
    stopInterval();
    caption.textContent = "PAUSED — TAKE YOUR TIME";
    modeLabel.textContent = "SESSION PAUSED";
    startPauseBtn.textContent = "Resume focus";
    timerNote.textContent = "Your session will be recorded when the timer reaches zero.";
  }
  function reset() {
    running = false;
    stopInterval();
    remainingSeconds = durationSeconds;
    updateRing();
    caption.textContent = "READY WHEN YOU ARE";
    modeLabel.textContent = "FOCUS SESSION";
    startPauseBtn.textContent = "Start focus";
    timerNote.textContent = "Completed sessions are automatically added to your study history.";
  }
  function setDuration(minutes) {
    if (running) pause();
    durationSeconds = minutes * 60;
    remainingSeconds = durationSeconds;
    presets.forEach(btn => btn.classList.toggle("selected", Number(btn.dataset.minutes) === minutes));
    updateRing();
    caption.textContent = "READY WHEN YOU ARE";
    modeLabel.textContent = "FOCUS SESSION";
    startPauseBtn.textContent = "Start focus";
    timerNote.textContent = `Ready for a ${minutes}-minute focus session.`;
  }

  startPauseBtn.addEventListener("click", () => running ? pause() : start());
  resetBtn.addEventListener("click", reset);
  presets.forEach(btn => btn.addEventListener("click", () => setDuration(Number(btn.dataset.minutes))));
  customForm.addEventListener("submit", event => {
    event.preventDefault();
    const minutes = Number(customMinutes.value);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
      customMinutes.setCustomValidity("Please enter a whole number between 1 and 600.");
      customMinutes.reportValidity();
      return;
    }
    customMinutes.setCustomValidity("");
    setDuration(minutes);
    presets.forEach(btn => btn.classList.remove("selected"));
  });
  customMinutes.addEventListener("input", () => customMinutes.setCustomValidity(""));
  window.addEventListener("beforeunload", stopInterval);
  updateRing();
  updateToday();
})();