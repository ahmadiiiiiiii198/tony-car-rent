"""Read base64 image data from a JSON file and save as JPGs into car_images/<car>/ folders."""
import json
import base64
import sys
from pathlib import Path

BASE_DIR = Path(r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images")

def save_images(json_path: str):
    data = json.loads(Path(json_path).read_text(encoding="utf-8"))
    car = data["car"]
    images = data["images"]
    
    car_dir = BASE_DIR / car
    car_dir.mkdir(parents=True, exist_ok=True)
    
    saved = 0
    for img in images:
        idx = img["index"]
        b64 = img["base64"]
        out = car_dir / f"{car}_{idx}.jpg"
        out.write_bytes(base64.b64decode(b64))
        saved += 1
    
    print(f"{car}: saved {saved} images")
    return saved

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python save_base64_images.py <json_path>")
        sys.exit(1)
    save_images(sys.argv[1])
