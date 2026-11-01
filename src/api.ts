import { API_BASE, ENDPOINTS } from "./config";
import { hideLoader, showLoader } from "./ui";

// Бэкенд хранит сессию в cookie. Здесь запоминаем только флаг
// «мы вошли», чтобы шапка сайта знала, что показывать.
const SESSION_FLAG = "band_logged_in";

export type Json = Record<string, unknown>;

export interface Profile {
  id: number;
  username: string;
  profile: {
    first_name: string;
    specialization: string;
    specialization_display: string;
    bio: string;
    fee: string;
  };
}

export interface Specialization {
  value: string;
  label: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const isLoggedIn = (): boolean => localStorage.getItem(SESSION_FLAG) === "1";
const markLoggedIn = (): void => localStorage.setItem(SESSION_FLAG, "1");
const markLoggedOut = (): void => localStorage.removeItem(SESSION_FLAG);

/** Превращает ответ с ошибкой в читаемую строку. */
function errorMessage(data: unknown, status: number, where: string): string {
  if (typeof data === "string" && data.trim().startsWith("<")) {
    return status === 404
      ? `Адрес не найден (404): ${where}`
      : `Ошибка сервера (${status}): ${where}`;
  }
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const d = data as Json;
    if (typeof d.detail === "string") return d.detail;
    if (typeof d.message === "string") return d.message;
    if (typeof d.error === "string") return d.error;
    const parts = Object.entries(d).map(([k, v]) => {
      const text = Array.isArray(v) ? v.join(" ") : String(v);
      return `${k}: ${text}`;
    });
    if (parts.length) return parts.join("\n");
  }
  if (status === 401 || status === 403) return "Нужно войти в систему";
  return `Ошибка сервера (${status})`;
}

async function request<T = Json>(
  path: string,
  options: { method?: string; body?: unknown; loaderText?: string; silent?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, loaderText, silent = false } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (!silent) showLoader(loaderText);
  try {
    let res: Response;
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: "include", // отправляем и принимаем сессионный cookie
      });
    } catch {
      throw new ApiError(
        "Не удалось связаться с сервером. Проверьте интернет (или CORS на бэкенде).",
        0,
      );
    }

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) markLoggedOut();
      throw new ApiError(errorMessage(data, res.status, `${method} ${API_BASE}${path}`), res.status);
    }
    return data as T;
  } finally {
    if (!silent) hideLoader();
  }
}

// ---------- методы API ----------
export async function register(username: string, password: string): Promise<void> {
  await request(ENDPOINTS.register, {
    method: "POST",
    body: { username, password },
    loaderText: "Регистрируем…",
  });
}

export async function login(username: string, password: string): Promise<void> {
  await request(ENDPOINTS.login, {
    method: "POST",
    body: { username, password },
    loaderText: "Входим…",
  });
  markLoggedIn();
}

export async function logout(): Promise<void> {
  try {
    await request(ENDPOINTS.logout, { method: "POST", body: {}, loaderText: "Выходим…" });
  } finally {
    markLoggedOut(); // выходим локально в любом случае
  }
}

export const getProfile = (): Promise<Profile> =>
  request<Profile>(ENDPOINTS.profile, { loaderText: "Загружаем профиль…" });

export const updateProfile = (payload: Json): Promise<Profile> =>
  request<Profile>(ENDPOINTS.profile, {
    method: "PATCH",
    body: payload,
    loaderText: "Сохраняем…",
  });

/** Список специализаций для выпадающего списка. Если не загрузился — пустой список. */
export async function getSpecializations(): Promise<Specialization[]> {
  try {
    return await request<Specialization[]>(ENDPOINTS.specializations, { silent: true });
  } catch {
    return [];
  }
}
