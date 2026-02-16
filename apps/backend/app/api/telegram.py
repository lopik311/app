from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.bot.handlers import apply_consent, apply_start
from app.core.config import settings
from app.db.session import get_db

router = APIRouter(prefix="/api/telegram", tags=["telegram"])

CONSENT_TEXT = "Согласие на обработку персональных данных: нажмите 'Принимаю', чтобы продолжить."


@router.post("/webhook")
def telegram_webhook(
    payload: dict,
    db: Session = Depends(get_db),
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
):
    if settings.telegram_webhook_secret and x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(status_code=401, detail="invalid secret")

    msg = payload.get("message", {})
    text = msg.get("text", "")
    user = msg.get("from")
    callback = payload.get("callback_query")

    if text == "/start" and user:
        apply_start(db, user)
        return {
            "method": "sendMessage",
            "chat_id": msg.get("chat", {}).get("id"),
            "text": CONSENT_TEXT,
            "reply_markup": {
                "inline_keyboard": [
                    [{"text": "Принимаю", "callback_data": "consent_accept"}],
                    [{"text": "Не принимаю", "callback_data": "consent_decline"}],
                ]
            },
        }

    if callback:
        action = callback.get("data")
        tg_id = callback.get("from", {}).get("id")
        chat_id = callback.get("message", {}).get("chat", {}).get("id")
        if action == "consent_accept" and tg_id:
            apply_consent(db, tg_id)
            return {
                "method": "sendMessage",
                "chat_id": chat_id,
                "text": "Согласие принято. Откройте приложение.",
                "reply_markup": {
                    "inline_keyboard": [
                        [{"text": "Открыть приложение", "web_app": {"url": settings.webapp_url}}],
                    ]
                },
            }
        if action == "consent_decline":
            return {"method": "sendMessage", "chat_id": chat_id, "text": "Без согласия работа с сервисом невозможна."}

    return {"ok": True}
