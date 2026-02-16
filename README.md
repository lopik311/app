# Telegram WebApp mini-CRM (MVP)

MVP для заявок на перевозку:
- Telegram bot: согласие ПДн + кнопка WebApp
- Клиент: заявки, создание, карточка и история
- Менеджер: заявки, модальное редактирование, клиенты, справочники
- Уведомление клиенту в Telegram при смене статуса

## Структура

```txt
apps/backend   FastAPI + Postgres
apps/frontend  Next.js UI (webapp + admin)
infra          docker-compose
.github/workflows
```

## Локальный запуск

1. Скопировать переменные:
```bash
cp .env.example .env
```

2. Запустить:
```bash
docker compose -f infra/docker-compose.yml up -d --build
```

3. Открыть:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/docs`

4. Создать первого менеджера:
```bash
curl -X POST "http://localhost:8000/api/admin/auth/bootstrap?email=admin@example.com&password=admin123"
```

## Прод через GHCR

1. После push в `main` workflow публикует:
- `ghcr.io/<org>/<repo>-backend:latest`
- `ghcr.io/<org>/<repo>-frontend:latest`
- и теги с `sha`.

2. На сервере:
```bash
docker login ghcr.io
docker pull ghcr.io/<org>/<repo>-backend:latest
docker pull ghcr.io/<org>/<repo>-frontend:latest
```

3. Запуск через compose (заменить образы в `infra/docker-compose.yml` на image и выполнить):
```bash
docker compose -f infra/docker-compose.yml up -d
```

## Telegram webhook

Установить webhook на:
`https://<your-domain>/api/telegram/webhook`

и передать `secret_token` равный `TELEGRAM_WEBHOOK_SECRET`.
