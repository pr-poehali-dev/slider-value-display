"""
Синхронизация данных трекера калорий.
Поддерживает products (справочник) и daily_entries (записи за день).
"""
import json
import os
import psycopg2
from datetime import date

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    # GET /sync?date=2024-01-01 — загрузить все данные
    if method == "GET":
        today = event.get("queryStringParameters", {}) or {}
        today_date = today.get("date", str(date.today()))

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT id, name, calories, potassium, phosphorus FROM products ORDER BY name")
        products = [
            {"id": r[0], "name": r[1], "calories": float(r[2]), "potassium": float(r[3]), "phosphorus": float(r[4])}
            for r in cur.fetchall()
        ]

        cur.execute(
            "SELECT id, product_id, product_name, grams, calories, potassium, phosphorus, eaten_at::text, created_at::text FROM daily_entries WHERE eaten_at = %s ORDER BY created_at",
            (today_date,)
        )
        entries = [
            {"id": r[0], "product_id": r[1], "product_name": r[2], "grams": float(r[3]),
             "calories": float(r[4]), "potassium": float(r[5]), "phosphorus": float(r[6]),
             "eaten_at": r[7], "created_at": r[8]}
            for r in cur.fetchall()
        ]

        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"products": products, "entries": entries})}

    # POST /sync — принять изменения с устройства
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        products = body.get("products", [])
        entries = body.get("entries", [])
        deleted_products = body.get("deleted_products", [])
        deleted_entries = body.get("deleted_entries", [])

        conn = get_conn()
        cur = conn.cursor()

        for p in products:
            cur.execute("""
                INSERT INTO products (id, name, calories, potassium, phosphorus, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON CONFLICT (id) DO UPDATE SET
                  name = EXCLUDED.name,
                  calories = EXCLUDED.calories,
                  potassium = EXCLUDED.potassium,
                  phosphorus = EXCLUDED.phosphorus,
                  updated_at = NOW()
            """, (p["id"], p["name"], p["calories"], p["potassium"], p["phosphorus"]))

        for e in entries:
            cur.execute("""
                INSERT INTO daily_entries (id, product_id, product_name, grams, calories, potassium, phosphorus, eaten_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (e["id"], e["product_id"], e["product_name"], e["grams"],
                  e["calories"], e["potassium"], e["phosphorus"], e["eaten_at"]))

        if deleted_products:
            cur.execute("UPDATE products SET name = name WHERE id = ANY(%s)", (deleted_products,))

        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "Method not allowed"})}
