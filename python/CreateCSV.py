import json
import csv
import os

# ตรวจสอบไฟล์
json_file = "python\hello.json"
if not os.path.exists(json_file):
    print(f"Error: File {json_file} not found")
    exit(1)

# โหลด JSON
try:
    with open(json_file, "r", encoding="utf-8") as f:
        data_sets = json.load(f)  # อ่าน JSON ที่ครอบด้วย []
except json.JSONDecodeError:
    print("Error: Invalid JSON format")
    exit(1)

# เตรียม header
header = ["model", "hand"] + [f"p{i}_{c}" for i in range(21) for c in ["x", "y", "z"]]
header += ["shoulder_x", "shoulder_y", "elbow_x", "elbow_y", "wrist_x", "wrist_y"]

# เขียน CSV
try:
    with open("hello.csv", "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(header)
        
        # วนลูปผ่านทุกชุดข้อมูล
        for data in data_sets:
            for entry in data:  # วนลูปผ่านมือซ้ายและขวาในแต่ละชุด
                row = [entry["model"], entry["hand"]]
                for point in entry["landmarks"]:
                    row.extend([point["x"], point["y"], point["z"]])
                row.extend([
                    entry["arm"]["shoulder"]["x"], entry["arm"]["shoulder"]["y"],
                    entry["arm"]["elbow"]["x"], entry["arm"]["elbow"]["y"],
                    entry["arm"]["wrist"]["x"], entry["arm"]["wrist"]["y"],
                ])
                writer.writerow(row)
    print("Created output.csv successfully")
except KeyError as e:
    print(f"Error: JSON structure missing key: {e}")
except Exception as e:
    print(f"Error: Failed to write CSV: {e}")