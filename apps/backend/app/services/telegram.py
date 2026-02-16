import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl

import httpx

from app.core.config import settings


def validate_init_data(init_data: str) -> dict:
    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    recv_hash = parsed.pop("hash", "")
    data_check_string = "\n".join([f"{k}={v}" for k, v in sorted(parsed.items())])
    secret_key = hmac.new(b"WebAppData", settings.bot_token.encode(), hashlib.sha256).digest()
    calc_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calc_hash, recv_hash):
        raise ValueError("invalid initData hash")

    auth_date = int(parsed.get("auth_date", "0"))
    if int(time.time()) - auth_date > settings.telegram_initdata_ttl_seconds:
        raise ValueError("initData expired")

    user = json.loads(parsed.get("user", "{}"))
    if not user:
        raise ValueError("user missing")
    return user


async def send_telegram_message(chat_id: int, text: str) -> None:
    if not settings.bot_token:
        return
    url = f"https://api.telegram.org/bot{settings.bot_token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text}
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(url, json=payload)
