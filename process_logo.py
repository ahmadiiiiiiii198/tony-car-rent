from PIL import Image
import numpy as np

def remove_black_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # Tolerance for "black"
    threshold = 30 

    for item in datas:
        # item is (R, G, B, A)
        # Check if pixel is close to black
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Make it transparent
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

remove_black_background("public/logo_raw.png", "public/logo.png")
