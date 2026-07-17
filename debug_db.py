import sqlite3
import os

db_path = "e:/Neffi Ai/neffi_clinical.db"
print("Checking:", db_path)
print("Exists:", os.path.exists(db_path))
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("PRAGMA table_info(patients)")
print(cur.fetchall())

db_path2 = "e:/Neffi Ai/Platform/Backend/neffi_clinical.db"
print("Checking:", db_path2)
print("Exists:", os.path.exists(db_path2))
conn2 = sqlite3.connect(db_path2)
cur2 = conn2.cursor()
cur2.execute("PRAGMA table_info(patients)")
print(cur2.fetchall())

conn.close()
conn2.close()
