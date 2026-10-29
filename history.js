(() => {
  const STORAGE_KEY = "barStudyPomodoroSessions";
  const dailyList = document.getElementById("dailyList");
  const emptyState = document.getElementById("emptyState");

  function readSessions() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }
  function localDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function prettyDate(dateString) {
    const [y, m, d] = dateString.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (dateString === localDateKey(today)) return "Today";
    if (dateString === localDateKey(yesterday)) return "Yesterday";
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }
  function render() {
    const sessions = readSessions().filter(s => s.date && Number(s.minutes) > 0);
    const total = sessions.reduce((sum, s) => sum + Number(s.minutes), 0);
    document.getElementById("totalMinutes").textContent = total;
    document.getElementById("totalSessions").textContent = sessions.length;

    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    const mondayKey = localDateKey(monday);
    const thisWeek = sessions.filter(s => s.date >= mondayKey && s.date <= localDateKey(now))
      .reduce((sum, s) => sum + Number(s.minutes), 0);
    document.getElementById("weekMinutes").textContent = thisWeek;

    const grouped = {};
    sessions.forEach(s => {
      grouped[s.date] = grouped[s.date] || { minutes: 0, count: 0 };
      grouped[s.date].minutes += Number(s.minutes);
      grouped[s.date].count += 1;
    });
    const days = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
    dailyList.innerHTML = "";
    emptyState.hidden = days.length > 0;
    dailyList.hidden = days.length === 0;
    const maxMinutes = Math.max(1, ...days.map(([, value]) => value.minutes));
    days.forEach(([date, value]) => {
      const row = document.createElement("div");
      row.className = "day-row";
      const dateEl = document.createElement("div");
      dateEl.className = "day-date";
      dateEl.textContent = prettyDate(date);
      const dateSmall = document.createElement("small");
      dateSmall.textContent = date;
      dateEl.appendChild(dateSmall);

      const barWrap = document.createElement("div");
      barWrap.className = "day-bar-wrap";
      barWrap.setAttribute("aria-label", `${value.minutes} minutes studied`);
      const bar = document.createElement("div");
      bar.className = "day-bar";
      bar.style.width = `${Math.max(3, value.minutes / maxMinutes * 100)}%`;
      barWrap.appendChild(bar);

      const meta = document.createElement("div");
      meta.className = "day-meta";
      const strong = document.createElement("strong");
      strong.textContent = `${value.minutes} min`;
      const small = document.createElement("small");
      small.textContent = `${value.count} ${value.count === 1 ? "session" : "sessions"}`;
      meta.append(strong, small);
      row.append(dateEl, barWrap, meta);
      dailyList.appendChild(row);
    });
  }
  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!readSessions().length) return;
    if (window.confirm("Delete all recorded study sessions from this browser? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
  });
  document.getElementById("exportBtn").addEventListener("click", () => {
    const sessions = readSessions().sort((a, b) => a.date.localeCompare(b.date) || (a.completedAt || "").localeCompare(b.completedAt || ""));
    const rows = [["Date", "Completed at", "Minutes"]];
    sessions.forEach(s => rows.push([s.date, s.completedAt || "", String(s.minutes || 0)]));
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bar-study-history.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
  render();
})();