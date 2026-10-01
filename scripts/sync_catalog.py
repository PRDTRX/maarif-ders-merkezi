import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "outcomes.json"
UPLOADS_DIR = ROOT / "uploads"


def normalize(value):
    return str(value or "").strip().casefold()


def slugify(value):
    value = str(value or "").strip().casefold()
    table = str.maketrans({
        "ç": "c",
        "ğ": "g",
        "ı": "i",
        "ö": "o",
        "ş": "s",
        "ü": "u"
    })
    value = value.translate(table)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def item_key(item):
    return (
        normalize(item.get("sinif")),
        normalize(item.get("ders")),
        normalize(item.get("tema")),
        normalize(item.get("id"))
    )


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
    print("uploads klasörü bulunamadı.")
    sys.exit(0)

outcome_map = {}

for item in outcomes:
    if not isinstance(item, dict):
        continue

    key = item_key(item)

    if key in outcome_map:
        print(
            "HATA: Aynı sınıf + ders + tema + kazanım kodu tekrar ediyor: "
            f"{item.get('sinif')} / {item.get('ders')} / "
            f"{item.get('tema')} / {item.get('id')}"
        )
        sys.exit(1)

    outcome_map[key] = item

changed = False
matched = 0
warnings = []

docx_files = sorted(
    path for path in UPLOADS_DIR.rglob("*")
    if path.is_file() and path.suffix.lower() == ".docx"
)

for path in docx_files:
    relative = path.relative_to(UPLOADS_DIR)

    if len(relative.parts) != 4:
        warnings.append(
            f"Beklenen klasör yapısında olmayan DOCX: "
            f"{path.relative_to(ROOT).as_posix()}"
        )
        continue

    ders_slug = relative.parts[0]
    sinif_slug = relative.parts[1]
    tema_slug = relative.parts[2]
    code = path.stem

    matches = [
        item for item in outcomes
        if slugify(item.get("ders")) == ders_slug
        and slugify(item.get("sinif")) == sinif_slug
        and slugify(item.get("tema")) == tema_slug
        and normalize(item.get("id")) == normalize(code)
    ]

    if len(matches) == 1:
        item = matches[0]
        relative_path = path.relative_to(ROOT).as_posix()

        if item.get("dosyaYolu") != relative_path:
            item["dosyaYolu"] = relative_path
            changed = True

        matched += 1

    elif len(matches) == 0:
        warnings.append(
            f"Eşleşme bulunamadı: {path.relative_to(ROOT).as_posix()}"
        )

    else:
        warnings.append(
            f"Birden fazla kazanımla eşleşti: "
            f"{path.relative_to(ROOT).as_posix()}"
        )

for warning in warnings:
    print(f"UYARI: {warning}")

if changed:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(outcomes, f, ensure_ascii=False, indent=2)
        f.write("\n")

print(f"Toplam DOCX: {len(docx_files)}")
print(f"Eşleşen kazanım: {matched}")
print(f"Katalog değişti: {'evet' if changed else 'hayır'}")
