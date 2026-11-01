// ---------- плашка загрузки ----------
let pending = 0;

export function showLoader(text = "Загрузка…"): void {
  pending++;
  const el = document.getElementById("loader");
  const label = document.getElementById("loader-text");
  if (label) label.textContent = text;
  if (el) el.hidden = false;
}

export function hideLoader(): void {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    const el = document.getElementById("loader");
    if (el) el.hidden = true;
  }
}

// ---------- уведомления ----------
let toastTimer: number | undefined;

export function toast(message: string, kind: "ok" | "error" = "ok"): void {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.className = `toast toast--${kind}`;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (el.hidden = true), 4500);
}

// ---------- мелкие помощники ----------
export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
