"""One-shot DB cleanup: strip any leading "<anything>https://" prefix from URL fields
that got saved double-prefixed when the frontend prepended BACKEND_URL to absolute
Cloudinary URLs. Idempotent — safe to run multiple times.

Run from the repo root:
    .\.venv313\Scripts\python.exe backend\scripts\fix_corrupted_urls.py
"""
import asyncio
import os
import re
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

load_dotenv(BACKEND_DIR / ".env")

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

# Matches anything before a second http(s):// — captures the real URL starting at the second occurrence.
DOUBLE_URL = re.compile(r"^.*?(https?://.+?(?:https?://|$))", re.IGNORECASE)


def repair(value):
    """Return repaired URL if `value` is a double-prefixed URL string; None otherwise."""
    if not isinstance(value, str):
        return None
    # Find the SECOND occurrence of https:// or http://
    idxs = [m.start() for m in re.finditer(r"https?://", value, re.IGNORECASE)]
    if len(idxs) >= 2:
        # The real URL starts at the last occurrence
        return value[idxs[-1]:]
    return None


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    fixes = 0

    # agency_settings
    settings = await db.agency_settings.find_one({})
    if settings:
        updates = {}
        for field in ("logo_url", "hero_logo_url", "hero_image_url", "video_url", "hero_video_url"):
            fixed = repair(settings.get(field))
            if fixed:
                print(f"agency_settings.{field}: {settings[field]!r} -> {fixed!r}")
                updates[field] = fixed
        new_hero = []
        hero_changed = False
        for u in settings.get("hero_images") or []:
            fixed = repair(u)
            if fixed:
                new_hero.append(fixed)
                hero_changed = True
                print(f"agency_settings.hero_images[]: {u!r} -> {fixed!r}")
            else:
                new_hero.append(u)
        if hero_changed:
            updates["hero_images"] = new_hero
        if updates:
            await db.agency_settings.update_one({"_id": settings["_id"]}, {"$set": updates})
            fixes += len(updates)

    # properties.images[].url
    async for prop in db.properties.find({}):
        new_images = []
        changed = False
        for img in prop.get("images", []) or []:
            fixed = repair(img.get("url"))
            if fixed:
                new_images.append({**img, "url": fixed})
                changed = True
                print(f"properties[{prop.get('title')!r}].images[]: {img['url']!r} -> {fixed!r}")
            else:
                new_images.append(img)
        if changed:
            await db.properties.update_one({"_id": prop["_id"]}, {"$set": {"images": new_images}})
            fixes += 1

    # locations.image_url
    async for loc in db.locations.find({}):
        fixed = repair(loc.get("image_url"))
        if fixed:
            await db.locations.update_one({"_id": loc["_id"]}, {"$set": {"image_url": fixed}})
            fixes += 1
            print(f"locations.{loc.get('name')!r}.image_url repaired")

    # users.foto_perfil
    async for user in db.users.find({}):
        fixed = repair(user.get("foto_perfil"))
        if fixed:
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"foto_perfil": fixed}})
            fixes += 1
            print(f"users.{user.get('username')!r}.foto_perfil repaired")

    print(f"\nDone. Fields repaired: {fixes}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
