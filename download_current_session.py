import os
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

# Base directory for all car images
BASE_DIR = Path(r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images")

def create_folders_if_needed():
    """Ensure base folder exists"""
    BASE_DIR.mkdir(parents=True, exist_ok=True)

def get_car_list_from_catalog():
    """Get the list of cars from the current WhatsApp catalog"""
    # This will be called from within the browser context
    car_buttons = page.query_selector_all('button[data-testid="product-item"]')
    cars = []

    for i, btn in enumerate(car_buttons):
        try:
            # Get car name from the button text
            car_name = btn.inner_text().split('\n')[0].replace(' ', '_')
            car_name = ''.join(c for c in car_name if c.isalnum() or c == '_')
            cars.append({
                'index': i,
                'name': car_name,
                'button': btn
            })
        except:
            continue

    return cars

def download_images_for_car(car_name, car_index):
    """Download all images for a specific car"""
    try:
        print(f"\nProcessing car {car_index + 1}: {car_name}")

        # Create folder for this car
        car_folder = BASE_DIR / car_name
        car_folder.mkdir(exist_ok=True)

        # Click on the car in catalog
        car_selector = f'button[data-testid="product-item"]:nth-child({car_index + 1})'
        page.click(car_selector)
        time.sleep(2)

        # Scroll to load images
        page.evaluate("window.scrollTo(0, 1200)")
        time.sleep(1)

        # Get all blob images
        images = page.evaluate('''() => {
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
        }''')

        print(f"  Found {len(images)} images")

        # Download each image
        downloaded = 0
        for img_data in images:
            try:
                img_index = img_data['index']
                blob_url = img_data['src']
                file_path = car_folder / f"{car_name}_{img_index}.jpg"

                # Open in new tab and save screenshot
                img_page = page.context.new_page()
                img_page.goto(blob_url, wait_until='domcontentloaded', timeout=8000)
                time.sleep(0.3)

                img_page.locator('img').first.screenshot(path=str(file_path), type='jpeg', quality=95)
                img_page.close()

                downloaded += 1
                print(f"    ✓ Downloaded {car_name}_{img_index}.jpg")

            except Exception as e:
                print(f"    ✗ Failed {car_name}_{img_index}: {e}")
                try:
                    img_page.close()
                except:
                    pass

        # Go back to catalog
        page.click('button[title="Back"]')
        time.sleep(1)

        return downloaded

    except Exception as e:
        print(f"Error processing {car_name}: {e}")
        return 0

def main():
    """Main download function using existing browser session"""
    create_folders_if_needed()

    print("Starting download from WhatsApp catalog...")
    print("Make sure the catalog is open in WhatsApp Web")

    # Get car list from catalog
    cars = page.evaluate('''() => {
        const buttons = Array.from(document.querySelectorAll('button[data-testid="product-item"]'));
        return buttons.map((btn, idx) => {
            const text = btn.innerText.split('\\n')[0];
            const name = text.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_');
            return { index: idx, name: name };
        });
    }''')

    print(f"Found {len(cars)} cars in catalog")

    total_downloaded = 0

    for car_data in cars:
        downloaded = download_images_for_car(car_data['name'], car_data['index'])
        total_downloaded += downloaded

        if (cars.index(car_data) + 1) % 5 == 0:
            print(f"\nProgress: {cars.index(car_data) + 1}/{len(cars)} cars processed, {total_downloaded} images downloaded")

    print("
====================")
    print(f"Download complete!")
    print(f"Total images downloaded: {total_downloaded}")
    print(f"Output: {BASE_DIR}")
    print("====================")

if __name__ == "__main__":
    main()
