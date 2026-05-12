"""One-shot script: upload everything in backend/uploads/ to Cloudinary,
then update any MongoDB documents that reference /api/uploads/<filename>
to use the new Cloudinary secure_url instead.

Run from the repo root:
    .\.venv313\Scripts\python.exe backend\scripts\migrate_uploads_to_cloudinary.py
"""
import asyncio
import os
import sys
from pathlib import Path

# Make the backend package importable so we share the same env loader.
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

if not os.environ.get("CLOUDINARY_URL"):
    sys.exit("CLOUDINARY_URL is not set in backend/.env — aborting.")

import cloudinary  # noqa: E402
import cloudinary.uploader  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

cloudinary.config(secure=True)

UPLOADS_DIR = BACKEND_DIR / "uploads"
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


def upload_one(path: Path) -> str:
    """Upload a single file to Cloudinary, return its secure_url."""
    public_id = path.stem  # reuse the UUID so re-runs are idempotent
    result = cloudinary.uploader.upload(
        str(path),
        folder="propiedades-rd",
        public_id=public_id,
        resource_type="image",
        overwrite=False,
    )
    return result["secure_url"]


async def update_db_references(url_map: dict[str, str]) -> dict[str, int]:
    """Scan all collections that may reference /api/uploads/<file> and
    rewrite the URL to its Cloudinary equivalent. Returns counts per field."""
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    stats: dict[str, int] = {}

    # Helper: replace any matching old URL inside a string.
    def remap(value):
        if isinstance(value, str):
            for old, new in url_map.items():
                if old in value:
                    return value.replace(old, new)
        return None  # unchanged

    # properties.images[].url  +  property top-level fields if any
    async for prop in db.properties.find({}):
        new_images = []
        changed = False
        for img in prop.get("images", []) or []:
            replaced = remap(img.get("url", ""))
            if replaced is not None:
                new_images.append({**img, "url": replaced})
                changed = True
            else:
                new_images.append(img)
        if changed:
            await db.properties.update_one({"_id": prop["_id"]}, {"$set": {"images": new_images}})
            stats["properties.images"] = stats.get("properties.images", 0) + 1

    # agency_settings: several URL fields
    settings = await db.agency_settings.find_one({})
    if settings:
        updates = {}
        for field in (
            "logo_url",
            "hero_logo_url",
            "hero_image_url",
            "video_url",
            "hero_video_url",
        ):
            replaced = remap(settings.get(field))
            if replaced is not None:
                updates[field] = replaced
        hero_images = settings.get("hero_images") or []
        new_hero = []
        hero_changed = False
        for u in hero_images:
            replaced = remap(u)
            if replaced is not None:
                new_hero.append(replaced)
                hero_changed = True
            else:
                new_hero.append(u)
        if hero_changed:
            updates["hero_images"] = new_hero
        if updates:
            await db.agency_settings.update_one({"_id": settings["_id"]}, {"$set": updates})
            stats["agency_settings"] = len(updates)

    # locations.image_url
    async for loc in db.locations.find({}):
        replaced = remap(loc.get("image_url"))
        if replaced is not None:
            await db.locations.update_one({"_id": loc["_id"]}, {"$set": {"image_url": replaced}})
            stats["locations.image_url"] = stats.get("locations.image_url", 0) + 1

    # users.foto_perfil
    async for user in db.users.find({}):
        replaced = remap(user.get("foto_perfil"))
        if replaced is not None:
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"foto_perfil": replaced}})
            stats["users.foto_perfil"] = stats.get("users.foto_perfil", 0) + 1

    client.close()
    return stats


def main() -> None:
    if not UPLOADS_DIR.is_dir():
        sys.exit(f"No uploads dir at {UPLOADS_DIR}")

    files = sorted(
        p for p in UPLOADS_DIR.iterdir() if p.is_file() and p.suffix.lower() in ALLOWED_EXT
    )
    if not files:
        print("No image files found in uploads/.")
        return

    print(f"Uploading {len(files)} files to Cloudinary (folder: propiedades-rd)...")
    url_map: dict[str, str] = {}
    failed: list[tuple[str, str]] = []

    for i, path in enumerate(files, 1):
        try:
            new_url = upload_one(path)
            url_map[f"/api/uploads/{path.name}"] = new_url
            print(f"  [{i}/{len(files)}] {path.name} -> {new_url}")
        except Exception as e:
            failed.append((path.name, str(e)))
            print(f"  [{i}/{len(files)}] FAILED {path.name}: {e}")

    print()
    print(f"Uploaded: {len(url_map)}/{len(files)}    Failed: {len(failed)}")
    if failed:
        for name, err in failed:
            print(f"  ! {name}: {err}")

    # Update DB references
    print()
    print("Scanning MongoDB for references to update...")
    stats = asyncio.run(update_db_references(url_map))
    if stats:
        print("DB documents updated:")
        for k, v in stats.items():
            print(f"  {k}: {v}")
    else:
        print("No DB references to /api/uploads/* found — nothing to rewrite.")


if __name__ == "__main__":
    main()
