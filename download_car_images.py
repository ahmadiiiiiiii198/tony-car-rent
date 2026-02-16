import os
import json
from playwright.sync_api import sync_playwright
import base64
import requests

# Base directory for all car images
BASE_DIR = r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images"

def create_folder_structure(car_names):
    """Create folders for each car"""
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
    
    for car_name in car_names:
        car_folder = os.path.join(BASE_DIR, car_name)
        if not os.path.exists(car_folder):
            os.makedirs(car_folder)
            print(f"Created folder: {car_folder}")

def download_images_from_browser():
    """Download images using the existing browser context"""
    with sync_playwright() as p:
        # Connect to the existing browser instance
        browser = p.chromium.connect_over_cdp("http://localhost:9222")
        context = browser.contexts[0] if browser.contexts else browser.new_context()
        page = context.pages[0] if context.pages else context.new_page()
        
        # Get all collected images from the browser
        collected_images = page.evaluate("() => window.collectedImages || []")
        
        if not collected_images:
            print("No images found in window.collectedImages")
            return
        
        print(f"Found {len(collected_images)} images to download")
        
        # Get unique car names
        car_names = list(set([img['car'] for img in collected_images]))
        
        # Create folder structure
        create_folder_structure(car_names)
        
        # Download each image
        for idx, img_data in enumerate(collected_images):
            car_name = img_data['car']
            img_url = img_data['url']
            img_index = img_data['index']
            
            # Create file path
            car_folder = os.path.join(BASE_DIR, car_name)
            file_name = f"{car_name}_{img_index}.jpg"
            file_path = os.path.join(car_folder, file_name)
            
            try:
                # Download image using browser
                # Navigate to the blob URL and capture the image
                image_page = context.new_page()
                image_page.goto(img_url)
                
                # Wait for image to load
                image_page.wait_for_selector('img', timeout=5000)
                
                # Get image element and save it
                img_element = image_page.locator('img').first
                img_element.screenshot(path=file_path)
                
                image_page.close()
                
                print(f"✓ Downloaded: {file_name} ({idx + 1}/{len(collected_images)})")
                
            except Exception as e:
                print(f"✗ Failed to download {file_name}: {str(e)}")
                continue
        
        print("\n✅ Download complete!")
        print(f"All images saved to: {BASE_DIR}")

if __name__ == "__main__":
    download_images_from_browser()
