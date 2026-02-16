import os
import json
from playwright.sync_api import sync_playwright
import time

# Base directory for all car images
BASE_DIR = r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images"

def create_folder_structure():
    """Create the base folder"""
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
        print(f"Created base directory: {BASE_DIR}")

def download_all_images():
    """Download all car images from WhatsApp catalog"""
    create_folder_structure()
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        
        # Navigate to WhatsApp
        print("Opening WhatsApp Web...")
        page.goto("https://web.whatsapp.com/")
        
        # Wait for user to scan QR code if needed
        print("Please wait for WhatsApp to load...")
        time.sleep(10)
        
        # Search for Tony
        print("Searching for Tony's chat...")
        search_box = page.locator('div[contenteditable="true"]').first
        search_box.click()
        search_box.fill("tony")
        time.sleep(2)
        
        # Click on Tony's chat
        tony_chat = page.locator('span:has-text("Tony")').first
        tony_chat.click()
        time.sleep(2)
        
        # Click on Catalog button
        print("Opening catalog...")
        catalog_btn = page.locator('button[title="Catalog"]').first
        catalog_btn.click()
        time.sleep(3)
        
        # Get all car buttons
        car_buttons = page.locator('button[data-testid="product-item"]').all()
        print(f"Found {len(car_buttons)} cars in catalog")
        
        total_downloaded = 0
        
        for i, car_btn in enumerate(car_buttons):
            try:
                # Get car name
                car_name_elem = car_btn.locator('span[class*="title"]').first
                car_name = car_name_elem.inner_text() if car_name_elem else f"Car_{i+1}"
                car_name = car_name.replace(" ", "_").replace("/", "_")
                
                print(f"\nProcessing {car_name} ({i+1}/{len(car_buttons)})...")
                
                # Create folder for this car
                car_folder = os.path.join(BASE_DIR, car_name)
                if not os.path.exists(car_folder):
                    os.makedirs(car_folder)
                
                # Click on car
                car_btn.click()
                time.sleep(2)
                
                # Scroll to load all images
                page.evaluate("window.scrollTo(0, 800)")
                time.sleep(1)
                
                # Get all blob images
                images = page.evaluate('''() => {
                    const imgs = document.querySelectorAll('img');
                    return Array.from(imgs)
                        .filter(img => img.src && img.src.includes('blob') && img.naturalWidth > 500)
                        .map((img, idx) => ({
                            index: idx + 1,
                            src: img.src,
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        }));
                }''')
                
                print(f"  Found {len(images)} images")
                
                # Download each image
                for img_data in images:
                    try:
                        # Open blob URL in new tab
                        img_page = context.new_page()
                        img_page.goto(img_data['src'])
                        time.sleep(0.5)
                        
                        # Save screenshot
                        file_path = os.path.join(car_folder, f"{car_name}_{img_data['index']}.jpg")
                        img_page.locator('img').first.screenshot(path=file_path, type='jpeg', quality=95)
                        img_page.close()
                        
                        total_downloaded += 1
                    except Exception as e:
                        print(f"  Failed to download image {img_data['index']}: {e}")
                
                # Go back to catalog
                back_btn = page.locator('button[title="Back"]').first
                if back_btn:
                    back_btn.click()
                    time.sleep(1)
                
            except Exception as e:
                print(f"Error processing car {i+1}: {e}")
                continue
        
        browser.close()
        
        print(f"\n{'='*50}")
        print(f"Download Complete!")
        print(f"Total images downloaded: {total_downloaded}")
        print(f"Location: {BASE_DIR}")
        print(f"{'='*50}")

if __name__ == "__main__":
    print("Starting WhatsApp Car Image Downloader...")
    print("Make sure WhatsApp Web is already logged in!")
    download_all_images()
