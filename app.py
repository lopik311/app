from flask import Flask, request, jsonify, render_template
import hashlib
import hmac
import os
import sqlite3
from urllib.parse import parse_qsl

app = Flask(__name__)
DB = "tasks.db"
BOT_TOKEN = os.getenv("BOT_TOKEN")
ADMIN_USER_ID = os.getenv("ADMIN_USER_ID", "6821628014")


def get_telegram_user_id():
    init_data = request.headers.get("X-Telegram-Init-Data", "")
    if not init_data:
        raise ValueError("Отсутствуют Telegram initData")

    data = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = data.pop("hash", None)
    if not received_hash:
        raise ValueError("Отсутствует hash в initData")

    if not BOT_TOKEN:
        raise ValueError("BOT_TOKEN не настроен на сервере")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(data.items()))
    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise ValueError("Неверная подпись initData")

    user_raw = data.get("user")
    if not user_raw:
        raise ValueError("Не найден пользователь в initData")

    import json
    user = json.loads(user_raw)
    user_id = user.get("id")
    if not user_id:
        raise ValueError("Не найден user.id в initData")

    return str(user_id)

# ===== Создание таблиц =====
conn = sqlite3.connect(DB)
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'Backlog',  -- Backlog, In Progress, Done
    created_by INTEGER
)
""")

c.execute("""
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    user_id INTEGER,
    content TEXT,
    FOREIGN KEY(task_id) REFERENCES tasks(id)
)
""")
conn.commit()
@@ -32,83 +71,95 @@ conn.close()

# ===== Главная страница =====
@app.route("/")
def index():
    return render_template("board.html")

# ===== API: получить все задачи =====
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT id, title, description, status, created_by FROM tasks")
    tasks = [{
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "status": row[3],
        "created_by": row[4]
    } for row in c.fetchall()]
    conn.close()
    return jsonify(tasks)

# ===== API: создать задачу (только админ) =====
@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.json
    user_id = data.get("user_id")
    if str(user_id) != "6821628014":
    try:
        user_id = get_telegram_user_id()
    except ValueError as error:
        return jsonify({"status": "error", "msg": str(error)}), 401

    data = request.json or {}
    if user_id != ADMIN_USER_ID:
        return jsonify({"status": "error", "msg": "Только админ может создавать задачи"}), 403

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("INSERT INTO tasks (title, description, created_by) VALUES (?, ?, ?)",
              (data["title"], data.get("description", ""), user_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# ===== API: обновить статус задачи (только админ) =====
@app.route("/api/tasks/<int:task_id>/status", methods=["POST"])
def update_task_status(task_id):
    data = request.json
    user_id = data.get("user_id")
    if str(user_id) != "6821628014":
    try:
        user_id = get_telegram_user_id()
    except ValueError as error:
        return jsonify({"status": "error", "msg": str(error)}), 401

    data = request.json or {}
    if user_id != ADMIN_USER_ID:
        return jsonify({"status": "error", "msg": "Только админ может менять статус"}), 403

    new_status = data.get("status")
    if new_status not in ["Backlog", "In Progress", "Done"]:
        return jsonify({"status": "error", "msg": "Неверный статус"}), 400

    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("UPDATE tasks SET status=? WHERE id=?", (new_status, task_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# ===== API: добавить комментарий =====
@app.route("/api/tasks/<int:task_id>/comments", methods=["POST"])
def add_comment(task_id):
    data = request.json
    user_id = data.get("user_id")
    try:
        user_id = get_telegram_user_id()
    except ValueError as error:
        return jsonify({"status": "error", "msg": str(error)}), 401

    data = request.json or {}
    content = data.get("content")
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)",
              (task_id, user_id, content))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})

# ===== API: получить комментарии =====
@app.route("/api/tasks/<int:task_id>/comments", methods=["GET"])
def get_comments(task_id):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute("SELECT user_id, content FROM comments WHERE task_id=?", (task_id,))
    comments = [{"user_id": row[0], "content": row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(comments)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
