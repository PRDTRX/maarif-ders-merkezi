import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "outcomes.json"
UPLOADS_DIR = ROOT / "uploads"


def norm(value):
    return str(value or "").strip().casefold()


if not DATA_FILE.exists():
    print("HATA: data/outcomes.json bulunamadı.")
    sys.exit(1)

try:
    with DATA_FILE.open("r", encoding="utf-8") as f:
        outcomes = json.load(f)
except json.JSONDecodeError as error:
    print(f"HATA: outcomes.json geçersiz JSON: {error}")
    sys.exit(1)

if not isinstance(outcomes, list):
    print("HATA: outcomes.json bir liste olmalıdır.")
    sys.exit(1)

if not UPLOADS_DIR.exists():
    print("uploads klasörü bulunamadı; katalog değişmedi.")
    sys.exit(0)

files = sorted(
    p for p in UPLOADS_DIR.rglob("*")
    if p.is_file() and p.suffix.lower() == ".docx"
)

files_by_code = {}

for path in files:
    code = norm(path.stem)
    if code:
        files_by_code.setdefault(code, []).append(path)

changed = False
matched = 0

for item in outcomes:
    if not isinstance(item, dict):
        continue

    item_id = norm(item.get("id"))

    if not item_id:
        continue

    matches = files_by_code.get(item_id, [])

    if not matches:
        continue

    path = matches[0]
    relative_path = path.relative_to(ROOT).as_posix()

    if item.get("dosyaYolu") != relative_path:
        item["dosyaYolu"] = relative_path
        changed = True

    matched += 1

duplicates = {
    code: paths
    for code, paths in files_by_code.items()
    if len(paths) > 1
}

if duplicates:
    print("UYARI: Aynı kazanım koduna ait birden fazla DOCX bulundu:")

    for code, paths in duplicates.items():
        print(f"- {code}")
        for path in paths:
            print(f"  {path.relative_to(ROOT).as_posix()}")

unmatched = [
    path for path in files
    if norm(path.stem) not in {
        norm(item.get("id"))
        for item in outcomes
        if isinstance(item, dict)
    }
]

if unmatched:
    print("UYARI: JSON'da karşılığı olmayan DOCX dosyaları:")

    for path in unmatched:
        print(f"- {path.relative_to(ROOT).as_posix()}")

if changed:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(outcomes, f, ensure_ascii=False, indent=2)
        f.write("\n")

print(f"Toplam DOCX: {len(files)}")
print(f"Eşleşen kazanım: {matched}")
print(f"Katalog değişti: {'evet' if changed else 'hayır'}")
