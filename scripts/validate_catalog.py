import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "outcomes.json"
UPLOADS_DIR = ROOT / "uploads"

errors = []
warnings = []

if not DATA_FILE.exists():
    errors.append("data/outcomes.json bulunamadı.")
else:
    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"outcomes.json geçersiz JSON: {e}")
        data = []

if not isinstance(data, list):
    errors.append("outcomes.json bir JSON dizisi olmalıdır.")
    data = []

ids = set()
paths = set()

for index, item in enumerate(data, start=1):
    if not isinstance(item, dict):
        errors.append(f"{index}. kayıt bir nesne değil.")
        continue

    for field in ("id", "sinif", "ders", "kategori", "baslik", "dosyaYolu"):
        if not str(item.get(field, "")).strip():
            errors.append(f"{index}. kayıt: '{field}' alanı eksik.")

    item_id = str(item.get("id", "")).strip()
    file_path = str(item.get("dosyaYolu", "")).strip()

    if item_id:
        if item_id in ids:
            errors.append(f"Tekrarlanan kazanım kodu: {item_id}")
        ids.add(item_id)

    if file_path:
        normalized = file_path.replace("\\", "/")
        if normalized in paths:
            errors.append(f"Tekrarlanan dosya yolu: {normalized}")
        paths.add(normalized)

        path = ROOT / normalized
        if not path.exists():
            warnings.append(f"DOCX henüz yüklenmemiş: {normalized}")
        elif path.suffix.lower() != ".docx":
            warnings.append(f"DOCX olmayan dosya: {normalized}")

    tags = item.get("etiketler", [])
    if not isinstance(tags, list):
        errors.append(f"{item_id or index}: 'etiketler' bir dizi olmalıdır.")

json_files = {
    str(p.relative_to(ROOT)).replace("\\", "/")
    for p in UPLOADS_DIR.rglob("*.docx")
} if UPLOADS_DIR.exists() else set()

referenced_files = {
    str(item.get("dosyaYolu", "")).replace("\\", "/")
    for item in data
    if isinstance(item, dict) and item.get("dosyaYolu")
}

unlisted = sorted(
    str(Path(path)).replace("\\", "/")
    for path in json_files
    if path not in referenced_files
)

for path in unlisted:
    warnings.append(f"JSON'da kaydı olmayan DOCX: {path}")

print(f"Kazanım sayısı: {len(data)}")
print(f"Tanımlı DOCX sayısı: {len(json_files)}")
print(f"Hata: {len(errors)}")
print(f"Uyarı: {len(warnings)}")

for warning in warnings:
    print(f"UYARI: {warning}")

if errors:
    print("\nHATALAR:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Katalog kontrolü başarılı.")
