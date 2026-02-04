from PIL import Image
import numpy as np

def remove_white_background(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path).convert("RGBA")
        data = np.array(img)
        
        # White background threshold
        threshold = 240
        
        # Find pixels that are close to white (high R, G, B)
        # Check all channels
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        white_mask = (r > threshold) & (g > threshold) & (b > threshold)
        
        # Set those pixels to transparent
        data[white_mask] = [255, 255, 255, 0]
        
        result = Image.fromarray(data)
        result.save(output_path, "PNG")
        print(f"Saved to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

remove_white_background("public/logo-newest.png", "public/logo-newest.png")
