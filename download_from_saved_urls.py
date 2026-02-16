import json
import os
import re
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_DIR = Path(r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images")
SAVED_JSON_PATH = Path(r"C:\Users\39351\AppData\Local\Temp\windsurf\mcp_output_4c62ed253f60a13c.txt")
PROFILE_DIR = BASE_DIR / "_playwright_profile"


def _load_saved_grouped(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="ignore")
    # File contains a "### Result" section followed by JSON, then possibly other text.
    marker = "### Result"
    start = text.find(marker)
    if start == -1:
        raise RuntimeError(f"Could not find '{marker}' in {path}")
    brace = text.find("{", start)
    if brace == -1:
        raise RuntimeError(f"Could not find JSON object start in {path}")

    decoder = json.JSONDecoder()
    data, _ = decoder.raw_decode(text[brace:])
    return data["grouped"]


def _ensure_folders(grouped: dict) -> None:
    BASE_DIR.mkdir(parents=True, exist_ok=True)
    for car in grouped.keys():
        (BASE_DIR / car).mkdir(parents=True, exist_ok=True)


def _flatten(grouped: dict) -> list[dict]:
    items: list[dict] = []
    for car, imgs in grouped.items():
        for i, img in enumerate(imgs):
            items.append(
                {
                    "car": car,
                    "index": int(img.get("index") or (i + 1)),
                    "url": img["url"],
                }
            )
    # stable ordering
    items.sort(key=lambda x: (x["car"], x["index"]))
    return items


def download_using_saved_urls(grouped: dict) -> None:
    """Download images by re-opening each car from the live catalog in the current session."""

    with sync_playwright() as p:
        # Use a dedicated persistent profile dir to avoid Chrome profile locking.
        # If you are not logged in inside this profile yet, WhatsApp will show a QR code.
        PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        context = p.chromium.launch_persistent_context(str(PROFILE_DIR), headless=False)
        page = context.new_page()
        page.goto("https://web.whatsapp.com/", wait_until="domcontentloaded")

        # Give time for WhatsApp to fully load (and for you to scan QR if needed)
        print("Waiting for WhatsApp Web to load (scan QR if prompted)...")
        time.sleep(12)

        cars = list(grouped.keys())
        total_expected = sum(len(v) for v in grouped.values())
        total_downloaded = 0
        total_failed = 0

        failed_items: list[dict] = []

        print("Make sure you are in the Tony Business chat before continuing.")
        print("Trying to open Catalog...")
        try:
            page.get_by_role("button", name="Catalog").click(timeout=15000)
        except Exception as e:
            raise RuntimeError(
                "Catalog button not found. Open the Tony Business chat manually, then re-run."
            ) from e

        time.sleep(2)

        for car_idx, car in enumerate(cars, start=1):
            car_label = car.replace("_", " ")
            print(f"\n[{car_idx}/{len(cars)}] {car}")

            try:
                page.get_by_role("button", name=re.compile(re.escape(car_label), re.IGNORECASE)).click(timeout=15000)
            except Exception:
                token = car_label.split()[0]
                page.get_by_role("button", name=re.compile(re.escape(token), re.IGNORECASE)).click(timeout=15000)

            time.sleep(2)
            page.evaluate("window.scrollTo(0, 1200)")
            time.sleep(1)

            images = page.evaluate(
                """() => {
                    const imgs = Array.from(document.querySelectorAll('img'));
                    const blobImgs = imgs.filter(img => img.src && img.src.includes('blob') && img.naturalWidth > 500);
                    const seen = new Set();
                    const unique = [];
                    for (const img of blobImgs) {
                      if (!seen.has(img.src)) {
                        seen.add(img.src);
                        unique.push(img);
                      }
                    }
                    return unique.map((img, idx) => ({ index: idx + 1, src: img.src }));
                }"""
            )

            if not images:
                print("  No images found")

            for img in images:
                idx = img["index"]
                blob_url = img["src"]
                out_path = BASE_DIR / car / f"{car}_{idx}.jpg"
                try:
                    img_page = context.new_page()
                    img_page.goto(blob_url, wait_until="domcontentloaded", timeout=10000)
                    time.sleep(0.3)
                    img_page.locator("img").first.screenshot(path=str(out_path), type="jpeg", quality=95)
                    img_page.close()
                    total_downloaded += 1
                except Exception as e:
                    total_failed += 1
                    failed_items.append({"car": car, "index": idx, "url": blob_url, "error": str(e)})
                    try:
                        img_page.close()
                    except Exception:
                        pass

            try:
                page.get_by_role("button", name="Back").click(timeout=15000)
            except Exception:
                pass
            time.sleep(1)

            print(f"  Car done. Total downloaded so far: {total_downloaded}")

        print("\n====================")
        print(f"Expected (saved list): {total_expected}")
        print(f"Downloaded: {total_downloaded}")
        print(f"Failed: {total_failed}")
        print(f"Output: {BASE_DIR}")
        print("====================")

        if failed_items:
            failed_path = BASE_DIR / "failed_downloads.json"
            failed_path.write_text(json.dumps(failed_items, indent=2), encoding="utf-8")
            print(f"Failed list saved to: {failed_path}")

        context.close()


if __name__ == "__main__":
    grouped_data = _load_saved_grouped(SAVED_JSON_PATH)
    _ensure_folders(grouped_data)
    download_using_saved_urls(grouped_data)
