import * as api from "./api";
import { FieldDef, LOGIN_FIELDS, REGISTER_FIELDS } from "./config";
import { navigate } from "./router";
import { escapeHtml, toast } from "./ui";

// ---------- общие куски ----------
function fieldHtml(f: FieldDef): string {
  const req = f.required ? "required" : "";
  const input = `<input name="${f.name}" type="${f.type}" ${req} autocomplete="${
    f.type === "password" ? "current-password" : "username"
  }" />`;
  return `<label class="field"><span>${escapeHtml(f.label)}</span>${input}</label>`;
}

function formValues(form: HTMLFormElement): api.Json {
  const out: api.Json = {};
  new FormData(form).forEach((v, k) => (out[k] = String(v)));
  return out;
}

function showError(form: HTMLFormElement, e: unknown): void {
  const box = form.querySelector<HTMLElement>(".form-error");
  const msg = e instanceof Error ? e.message : "Что-то пошло не так";
  if (box) {
    box.textContent = msg;
    box.hidden = false;
  }
}

function clearError(form: HTMLFormElement): void {
  const box = form.querySelector<HTMLElement>(".form-error");
  if (box) box.hidden = true;
}

// ---------- главная ----------
export function renderHome(root: HTMLElement): void {
  const logged = api.isLoggedIn();
  root.innerHTML = `
    <section class="hero">
      <p class="hero__kicker">Рок-группа из Бишкека</p>
      <h1 class="hero__title">VOLT<span>AGE</span></h1>
      <p class="hero__text">
        Громкие гитары, живая сцена и новый альбом «Короткое замыкание».
        Зарегистрируйтесь, чтобы попасть в клуб фанатов и первыми узнавать о концертах.
      </p>
      <div class="hero__actions">
        ${
          logged
            ? `<a class="btn" href="#/profile">Мой профиль</a>`
            : `<a class="btn" href="#/register">Вступить в клуб</a>
               <a class="btn btn--ghost" href="#/login">Войти</a>`
        }
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">Состав</h2>
      <div class="cards">
        <article class="card"><h3>Артём</h3><p class="card__role">Вокал</p></article>
        <article class="card"><h3>Айбек</h3><p class="card__role">Гитара</p></article>
        <article class="card"><h3>Дина</h3><p class="card__role">Бас</p></article>
        <article class="card"><h3>Тимур</h3><p class="card__role">Ударные</p></article>
      </div>
    </section>

    <section class="section">
      <h2 class="section__title">Ближайшие концерты</h2>
      <ul class="tour">
        <li><time>12 дек</time><b>Бишкек</b><span>Клуб «Ритм»</span></li>
        <li><time>20 дек</time><b>Ош</b><span>Дворец культуры</span></li>
        <li><time>27 дек</time><b>Каракол</b><span>Open air Arena</span></li>
      </ul>
    </section>
  `;
}

// ---------- регистрация ----------
export function renderRegister(root: HTMLElement): void {
  root.innerHTML = `
    <section class="auth">
      <h1 class="auth__title">Регистрация</h1>
      <form class="form" novalidate>
        ${REGISTER_FIELDS.map(fieldHtml).join("")}
        <p class="form-error" hidden></p>
        <button class="btn btn--block" type="submit">Создать аккаунт</button>
      </form>
      <p class="auth__alt">Уже есть аккаунт? <a href="#/login">Войти</a></p>
    </section>
  `;
  const form = root.querySelector("form") as HTMLFormElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(form);
    if (!form.reportValidity()) return;
    const values = formValues(form);
    try {
      await api.register(String(values.username), String(values.password));
      // после регистрации сразу входим, чтобы открыть профиль
      await api.login(String(values.username), String(values.password));
      toast("Добро пожаловать в клуб!");
      navigate("profile");
    } catch (err) {
      showError(form, err);
    }
  });
}

// ---------- вход ----------
export function renderLogin(root: HTMLElement): void {
  root.innerHTML = `
    <section class="auth">
      <h1 class="auth__title">Вход</h1>
      <form class="form" novalidate>
        ${LOGIN_FIELDS.map(fieldHtml).join("")}
        <p class="form-error" hidden></p>
        <button class="btn btn--block" type="submit">Войти</button>
      </form>
      <p class="auth__alt">Нет аккаунта? <a href="#/register">Зарегистрироваться</a></p>
    </section>
  `;
  const form = root.querySelector("form") as HTMLFormElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(form);
    if (!form.reportValidity()) return;
    try {
      const v = formValues(form);
      await api.login(String(v.username), String(v.password));
      toast("Вы вошли в систему");
      navigate("profile");
    } catch (err) {
      showError(form, err);
    }
  });
}

// ---------- профиль ----------
export async function renderProfile(root: HTMLElement): Promise<void> {
  if (!api.isLoggedIn()) {
    navigate("login");
    return;
  }

  root.innerHTML = `<section class="auth"><h1 class="auth__title">Профиль</h1><div id="profile-box"></div></section>`;
  const box = root.querySelector("#profile-box") as HTMLElement;

  let data: api.Profile;
  let specs: api.Specialization[];
  try {
    [data, specs] = await Promise.all([api.getProfile(), api.getSpecializations()]);
  } catch (err) {
    if (!api.isLoggedIn()) {
      toast("Сессия истекла, войдите заново", "error");
      navigate("login");
      return;
    }
    box.innerHTML = `<p class="form-error">${escapeHtml(
      err instanceof Error ? err.message : "Ошибка",
    )}</p>`;
    return;
  }

  const p = data.profile;
  const name = p.first_name || data.username;

  // если список специализаций не загрузился — хотя бы текущее значение
  if (!specs.some((s) => s.value === p.specialization)) {
    specs.push({ value: p.specialization, label: p.specialization_display || p.specialization });
  }
  const options = specs
    .map(
      (s) =>
        `<option value="${escapeHtml(s.value)}" ${s.value === p.specialization ? "selected" : ""}>${escapeHtml(
          s.label,
        )}</option>`,
    )
    .join("");

  box.innerHTML = `
    <div class="profile-head">
      <div class="avatar">${escapeHtml(String(name).charAt(0).toUpperCase())}</div>
      <div>
        <h2>${escapeHtml(name)}</h2>
        <p class="muted">@${escapeHtml(data.username)} · ${escapeHtml(p.specialization_display)}</p>
      </div>
    </div>
    <form class="form" novalidate>
      <label class="field"><span>Имя пользователя</span>
        <input value="${escapeHtml(data.username)}" readonly />
      </label>
      <label class="field"><span>Имя</span>
        <input name="first_name" type="text" value="${escapeHtml(p.first_name)}" />
      </label>
      <label class="field"><span>Специализация</span>
        <select name="specialization">${options}</select>
      </label>
      <label class="field"><span>О себе</span>
        <textarea name="bio" rows="4">${escapeHtml(p.bio)}</textarea>
      </label>
      <label class="field"><span>Гонорар</span>
        <input name="fee" type="number" step="0.01" min="0" value="${escapeHtml(p.fee)}" />
      </label>
      <p class="form-error" hidden></p>
      <button class="btn btn--block" type="submit">Сохранить изменения</button>
    </form>
  `;

  const form = box.querySelector("form") as HTMLFormElement;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError(form);
    try {
      await api.updateProfile(formValues(form));
      toast("Профиль сохранён");
      await renderProfile(root);
    } catch (err) {
      showError(form, err);
    }
  });
}
