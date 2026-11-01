// Бэкенд: https://inai-col2.fishrungames.com/api/docs/  (Swagger)
// Авторизация — через сессионный cookie (токена в API нет).

export const API_BASE = "https://inai-col2.fishrungames.com/api";

export const ENDPOINTS = {
  register: "/register/", // POST {username, password}
  login: "/login/", // POST {username, password}
  logout: "/logout/", // POST
  profile: "/profile/", // GET, PATCH {first_name, specialization, bio, fee}
  specializations: "/specializations/", // GET [{value, label}]
};

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "password";
  required?: boolean;
}

export const REGISTER_FIELDS: FieldDef[] = [
  { name: "username", label: "Имя пользователя", type: "text", required: true },
  { name: "password", label: "Пароль", type: "password", required: true },
];

export const LOGIN_FIELDS: FieldDef[] = [
  { name: "username", label: "Имя пользователя", type: "text", required: true },
  { name: "password", label: "Пароль", type: "password", required: true },
];
