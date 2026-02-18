from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.models.client import Client
from app.models.delivery_slot import DeliverySlot
from app.models.direction import Direction
from app.models.organization import Organization
from app.models.request import Request


def _pick_font() -> str:
    font_name = "InvoiceSans"
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for item in candidates:
        path = Path(item)
        if path.exists():
            pdfmetrics.registerFont(TTFont(font_name, str(path)))
            return font_name
    return "Helvetica"


def build_request_invoice_pdf(
    req: Request,
    client: Client,
    direction: Direction,
    slot: DeliverySlot,
    org: Organization | None,
) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    font = _pick_font()

    y = height - 56

    def draw(line: str, size: int = 11, gap: int = 16) -> None:
        nonlocal y
        pdf.setFont(font, size)
        pdf.drawString(48, y, line)
        y -= gap

    now = datetime.now(timezone.utc).astimezone()
    draw(f"Счет на оплату по заявке №{req.request_number}", 16, 26)
    draw(f"Дата формирования: {now.strftime('%d.%m.%Y %H:%M')}")
    draw("")
    draw("Плательщик", 13, 20)
    draw(f"Организация: {org.name if org and org.name else '-'}")
    draw(f"ИНН: {org.inn if org and org.inn else '-'}   КПП: {org.kpp if org and org.kpp else '-'}")
    draw(f"ОГРН: {org.ogrn if org and org.ogrn else '-'}")
    draw(f"Адрес: {org.address if org and org.address else '-'}")
    draw(f"Контакт (Telegram): @{client.username}")
    draw("")
    draw("Реквизиты получателя", 13, 20)
    draw(f"Банк: {org.bank if org and org.bank else '-'}")
    draw(f"Р/счет: {org.settlement_account if org and org.settlement_account else '-'}")
    draw(f"Корсчет: {org.correspondent_account if org and org.correspondent_account else '-'}")
    draw(f"БИК: {org.bik if org and org.bik else '-'}")
    draw("")
    draw("Основание начисления", 13, 20)
    draw(f"Направление: {direction.name}")
    draw(f"Дата доставки: {slot.date}")
    draw(f"Кол-во коробов: {req.boxes_count}")
    draw(f"Вес (кг): {float(req.weight_kg):.2f}")
    draw(f"Объем (м3): {float(req.volume_m3):.2f}")
    draw(f"Комментарий: {req.comment or '-'}")
    draw("")
    draw("Сумма к оплате: согласно договору и действующему прайсу.", 12, 22)
    draw(f"Договор: {org.contract if org and org.contract else '-'}")
    draw("")
    draw("Документ сформирован автоматически в Mini CRM.", 10, 16)

    pdf.showPage()
    pdf.save()
    return buffer.getvalue()
