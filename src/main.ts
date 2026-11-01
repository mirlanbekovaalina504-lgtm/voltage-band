import "./style.css";
import * as api from "./api";
import { renderHome, renderLogin, renderProfile, renderRegister } from "./pages";
import { currentRoute, navigate } from "./router";
import { toast } from "./ui";

const app = document.getElementById("app") as HTMLElement;

function layout(): HTMLElement {
  const logged = api.isLoggedIn();
  app.innerHTML = `
    <header class="header">
      <a class="logo" href="#/home">VOLT<span>AGE</span></a>
      <nav class="nav">
        ${
          logged
            ? `<a href="#/profile">Профиль</a><button id="logout" class="nav__btn">Выйти</button>`
            : `<a href="#/login">Войти</a><a class="nav__cta" href="#/register">Регистрация</a>`
        }
      </nav>
    </header>
    <main id="page" class="page"></main>
    <footer class="footer">© 2026 VOLTAGE · Домашнее задание №8</footer>
  `;

  document.getElementById("logout")?.addEventListener("click", async () => {
    try {
      await api.logout();
    } catch {
      /* токен уже сброшен локально */
    }
    toast("Вы вышли из системы");
    navigate("home");
    render();
  });

  return document.getElementById("page") as HTMLElement;
}

async function render(): Promise<void> {
  const page = layout();
  switch (currentRoute()) {
    case "login":
      return renderLogin(page);
    case "register":
      return renderRegister(page);
    case "profile":
      return renderProfile(page);
    default:
      return renderHome(page);
  }
}

window.addEventListener("hashchange", render);
render();
