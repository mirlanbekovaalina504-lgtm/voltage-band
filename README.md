# VOLTAGE — сайт музыкальной группы (ДЗ 8)

TypeScript + Vite. Регистрация, вход, выход, просмотр и редактирование профиля.

## Запуск

    npm install
    npm run dev

## Что сверить со Swagger

Всё в `src/config.ts`: пути эндпоинтов, поля регистрации и входа, метод
сохранения профиля, схема токена (`Bearer` / `Token`).

## Деплой на GitHub Pages

1. Создайте репозиторий и запушьте код в ветку `main`.
2. Settings → Pages → Source: **GitHub Actions**.
3. После пуша workflow `.github/workflows/deploy.yml` соберёт и опубликует сайт.
