// Роутер на hash (#/login) — работает на GitHub Pages без настройки 404.
export type Route = "home" | "login" | "register" | "profile";

const ROUTES: Route[] = ["home", "login", "register", "profile"];

export function currentRoute(): Route {
  const name = location.hash.replace(/^#\/?/, "") || "home";
  return (ROUTES as string[]).includes(name) ? (name as Route) : "home";
}

export function navigate(route: Route): void {
  location.hash = `#/${route}`;
}
