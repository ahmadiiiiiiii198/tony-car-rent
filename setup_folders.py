import os
import json
import base64
import requests

# Base directory for all car images
BASE_DIR = r"C:\Users\39351\Downloads\tonaydin-luxury-cars\car_images"

# Car list from WhatsApp catalog
CARS = [
    "Fiat_Panda_Hybrid", "Audi_RS_Q8", "Porsche_911_Carrera_Cabrio", "Aston_Martin_DB11",
    "Ferrari_F8_Tributo", "Audi_RS_3", "Mercedes_Benz_AMG_A45s", "Volkswagen_T-Roc",
    "Peugeot_3008", "Alfa_Romeo_Stelvio", "Audi_RS_3_24", "Lancia_Ypsilon",
    "Fiat_500", "Mclaren_570s_Spider", "Ford_Edge_Vignale", "Smart_Fortwo",
    "Peugeot_Boxer", "Maserati_Levante", "Nissan_Qashqai_Business", "Porsche_718_Spyder",
    "Audi_RS_5_23", "Fiat_Tipo", "Toyota_C-HR_1.8", "Toyota_C-HR_2.0_Hybrid",
    "Fiat_500x", "Lamborghini_Huracan_Evo", "Audi_RS_3_19", "Audi_A3",
    "Citroen_C3Aircross", "Fiat_500_Hybrid", "Fiat_500x_95cv", "Ferrari_488_Pista",
    "Volkswagen_Polo", "Peugeot_3008_Hybrid4", "Mercedes_Benz_AMG_a45s_lc", "Porsche_Macan",
    "Mercedes_Sprinter", "Renault_Clio_V", "Fiat_Panda_1.2cc", "Renault_Austral",
    "Lynk_Co_01", "Renault_Arkana", "Renault_Megane", "Renault_Clio_Intens",
    "Bmw_118d", "Toyota_Aygo", "Toyota_Yaris_GR", "DS_7_Performance_Line",
    "Mercedes_Benz_AMG_G_63", "Audi_RS_3_22", "Ford_Puma", "Nissan_Juke",
    "Tempest_530_Yamaha_f40", "Fiat_Ducato", "Opel_Grandland", "Toyota_C-HR_18",
    "Peugeot_3008_15HDi", "Abarth_595c_Competizione", "Mercedes_Benz_AMG_A45s_421cv",
    "Alfa_Romeo_Stelvio_190cv", "Fiat_Ducato_22Mtj3", "Ford_Puma_Ecoboost",
    "Renault_Trafic_Van", "Opel_Corsa", "Toyota_Yaris_10", "Audi_RS_6_23",
    "Bmw_M135i", "Toyota_Yaris_15_Hybrid", "Audi_RS_Q3", "Audi_RS_6"
]

def create_folders():
    """Create folders for all cars"""
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR)
        print(f"Created base directory: {BASE_DIR}")
    
    for car in CARS:
        car_folder = os.path.join(BASE_DIR, car)
        if not os.path.exists(car_folder):
            os.makedirs(car_folder)
    
    print(f"✓ Created {len(CARS)} car folders")

def save_collected_images_data():
    """Save the collected images data to a JSON file for reference"""
    data_file = os.path.join(BASE_DIR, "collected_images_data.json")
    
    # Create a template structure for the collected images
    collected_images = {
        "total_images": 423,
        "total_cars": 70,
        "cars": CARS,
        "note": "Images were collected from WhatsApp catalog with blob URLs. Download using browser automation."
    }
    
    with open(data_file, 'w') as f:
        json.dump(collected_images, f, indent=2)
    
    print(f"✓ Saved images data to: {data_file}")

if __name__ == "__main__":
    print("Creating folder structure for car images...")
    create_folders()
    save_collected_images_data()
    print(f"\n📁 All folders created in: {BASE_DIR}")
    print("Ready for image download!")
