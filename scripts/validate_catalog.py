import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "outcomes.json"
UPLOADS_DIR = ROOT / "uploads"


def normalize(value):
    return str(value or "").strip().casefold()


def item_key(item):
    return (
        normalize(item.get("sinif")),
        normalize(item.get("ders")),
        normalize(item.get("tema")),
        normalize(item.get("id"))
    )


errors = []
warnings = []

if not DATA_FILE.exists():
    errors.append("data/outcomes.json bulunamadı.")
    data = []
else:
    try:
        with DATA_FILE.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as error:
        errors.append(f"outcomes.json geçersiz JSON: {error}")
        data = []

if not isinstance(data, list):
    errors.append("outcomes.json bir JSON dizisi olmalıdır.")
    data = []

keys = set()
paths = set()

for index, item in enumerate(data, start=1):
    if not isinstance(item, dict):
        errors.append(f"{index}. kayıt bir nesne değil.")
        continue

    for field in ("id", "sinif", "ders", "tema", "kategori", "baslik", "dosyaYolu"):
        if not str(item.get(field, "")).strip():
            errors.append(f"{index}. kayıt: '{field}' alanı eksik.")

    key = item_key(item)

    if key in keys:
        errors.append(
            f"Tekrarlanan kayıt: "
            f"{item.get('sinif')} / {item.get('ders')} / "
            f"{item.get('tema')} / {item.get('id')}"
        )

    keys.add(key)

    file_path = str(item.get("dosyaYolu", "")).strip()

    if file_path:
        normalized_path = file_path.replace("\\", "/")

        if normalized_path in paths:
            errors.append(f"Tekrarlanan dosya yolu: {normalized_path}")

        paths.add(normalized_path)

        path = ROOT / normalized_path

        if not path.exists():
            warnings.append(f"DOCX henüz yüklenmemiş: {normalized_path}")

        elif path.suffix.lower() != ".docx":
            warnings.append(f"DOCX olmayan dosya: {normalized_path}")

    tags = item.get("etiketler", [])

    if not isinstance(tags, list):
        errors.append(
            f"{item.get('id') or index}: 'etiketler' bir dizi olmalıdır."
        )

docx_files = {
    path.relative_to(ROOT).as_posix()
    for path in UPLOADS_DIR.rglob("*.docx")
} if UPLOADS_DIR.exists() else set()

referenced_files = {
    str(item.get("dosyaYolu", "")).replace("\\", "/")
    for item in data
    if isinstance(item, dict) and item.get("dosyaYolu")
}

unlisted = sorted(docx_files - referenced_files)

for path in unlisted:
    warnings.append(f"JSON'da kaydı olmayan DOCX: {path}")

print(f"Kazanım sayısı: {len(data)}")
print(f"Yüklü DOCX sayısı: {len(docx_files)}")
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
