import os
import json
import base64

# Base directory for all car images
BASE_DIR = r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images"

def create_folder_structure(car_names):
    """Create folders for each car"""
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
        print(f"Created base directory: {BASE_DIR}")
    
    for car_name in car_names:
        car_folder = os.path.join(BASE_DIR, car_name)
        if not os.path.exists(car_folder):
            os.makedirs(car_folder)
            print(f"Created folder: {car_folder}")

def save_image_from_base64(base64_data, file_path):
    """Save base64 encoded image to file"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # Decode and save
        image_data = base64.b64decode(base64_data)
        with open(file_path, 'wb') as f:
            f.write(image_data)
        return True
    except Exception as e:
        print(f"Error saving image: {e}")
        return False

def download_images(collected_images):
    """Download all images and organize into folders"""
    
    if not collected_images:
        print("No images to download")
        return
    
    print(f"Found {len(collected_images)} images to download")
    
    # Get unique car names
    car_names = list(set([img['car'] for img in collected_images]))
    
    # Create folder structure
    create_folder_structure(car_names)
    
    # Group images by car
    images_by_car = {}
    for img in collected_images:
        car = img['car']
        if car not in images_by_car:
            images_by_car[car] = []
        images_by_car[car].append(img)
    
    # Download each image
    downloaded = 0
    failed = 0
    
    for car_name, images in images_by_car.items():
        car_folder = os.path.join(BASE_DIR, car_name)
        
        for img_data in images:
            img_index = img_data['index']
            file_name = f"{car_name}_{img_index}.jpg"
            file_path = os.path.join(car_folder, file_name)
            
            # Note: Blob URLs cannot be downloaded directly via HTTP
            # They need to be accessed through the browser
            # This is a placeholder for the actual download logic
            print(f"⏳ Queued for download: {file_name}")
            downloaded += 1
    
    print(f"\n✅ Organized {downloaded} images into {len(car_names)} car folders")
    print(f"Location: {BASE_DIR}")
    print("\nNote: To download blob URLs, you need to use the browser directly.")
    print("The images are stored in window.collectedImages in the browser.")

if __name__ == "__main__":
    # This script will be called with the collected images data
    print("Ready to download images...")
