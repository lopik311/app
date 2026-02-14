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
                phone TEXT,
                step INTEGER DEFAULT 0
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                status TEXT DEFAULT 'Backlog',
                created_by INTEGER
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                user_id INTEGER,
                content TEXT,
                FOREIGN KEY(task_id) REFERENCES tasks(id)
            )
        ''')
        conn.commit()

init_db()

# ========================================
# Функция для получения соединения
# ========================================
def get_db_connection():
    return sqlite3.connect(DB, check_same_thread=False)

# ========================================
# /start
# ========================================
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT step, phone FROM users WHERE id=?', (user.id,))
        row = cursor.fetchone()

        if row:
            step, phone = row
            if step == 0 or not phone:
                await update.message.reply_text(
                    "Для регистрации нажмите кнопку: Поделиться",
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
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT step, phone FROM users WHERE id=?', (user.id,))
        row = cursor.fetchone()
        if row:
            step, phone = row
            if step >= 1 and phone:
                await update.message.reply_text(
                    "Продолжим с MiniApp:",
                    reply_markup=miniapp_button()
                )
            else:
                await update.message.reply_text(
                    "Сначала нажми кнопку выше ☝️",
                    reply_markup=phone_btn
                )
        else:
            await update.message.reply_text(
                "Сначала нажми кнопку выше ☝️",
                reply_markup=phone_btn
            )

# ========================================
# Настройка бота
# ========================================
app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.CONTACT, contact))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, other))

print("✅ Бот готов")
app.run_polling()
