import os
import sqlite3
from dotenv import load_dotenv
from telegram import (
    Update,
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
    ReplyKeyboardRemove
)
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# ========================================
# Загрузка переменных окружения
# ========================================
load_dotenv()
TOKEN = os.getenv("BOT_TOKEN")
MINIAPP_URL = os.getenv("MINIAPP_URL")

if not TOKEN:
    raise RuntimeError("BOT_TOKEN не задан в переменных окружения")

if not MINIAPP_URL:
    raise RuntimeError("MINIAPP_URL не задан в переменных окружения")

DB = "tasks.db"

# ========================================
# Кнопки
# ========================================
phone_btn = ReplyKeyboardMarkup(
    [[KeyboardButton("📱 Поделиться", request_contact=True)]],
    resize_keyboard=True
)

def miniapp_button():
    return InlineKeyboardMarkup(
        [[InlineKeyboardButton("🚀 MiniApp", web_app=WebAppInfo(url=MINIAPP_URL))]]
    )

# ========================================
# Создание базы и таблиц
# ========================================
def init_db():
    with sqlite3.connect(DB) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT,
@@ -94,50 +100,57 @@ async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
                    reply_markup=phone_btn
                )
            else:
                await update.message.reply_text(
                    "Для открытия приложения используйте кнопу MiniApp:",
                    reply_markup=miniapp_button()
                )
        else:
            cursor.execute(
                'INSERT INTO users (id, username, step) VALUES (?,?,0)',
                (user.id, user.username)
            )
            conn.commit()
            await update.message.reply_text(
                "Для регистрации нажмите кнопку: Поделиться",
                reply_markup=phone_btn
            )

# ========================================
# Обработка контакта
# ========================================
async def contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    contact = update.message.contact
    user = update.effective_user

    if not contact or contact.user_id != user.id:
        await update.message.reply_text(
            "Пожалуйста, отправьте ваш собственный контакт через кнопку ниже.",
            reply_markup=phone_btn
        )
        return

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (id, username, phone, step)
            VALUES (?,?,?,1)
            ON CONFLICT(id) DO UPDATE SET phone=?, step=1
        ''', (user.id, user.username, contact.phone_number, contact.phone_number))
        conn.commit()

    # Убираем клавиатуру и показываем MiniApp
    await update.message.reply_text(
        "Регистрация завершена",
        reply_markup=ReplyKeyboardRemove()
    )
        
    await update.message.reply_text(
        "Используйте приложение для дальнейшей работы",
        reply_markup=miniapp_button()
    )

# ========================================
# Любые другие текстовые сообщения
# ========================================
async def other(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
