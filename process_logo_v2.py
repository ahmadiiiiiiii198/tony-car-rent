from PIL import Image
import numpy as np

def clean_transparency(input_path, output_path):
    print(f"Processing {input_path}...")
    try:
        img = Image.open(input_path).convert("RGBA")
        data = np.array(img, dtype=np.float32)
        
        # Calculate apparent brightness of each pixel
        # R, G, B
        r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
        
        # We assume the background is black (0,0,0).
        # We want to set alpha based on brightness to remove the black background smoothly.
        # This acts like a "Screen" blend mode baked into the alpha channel.
        # Alpha = max(r, g, b) is a good approximation for additive colors on black.
        
        max_channel = np.max(data[:,:,:3], axis=2)
        
        # We boost the alpha slightly to ensure the colors stay vibrant and not too transparent
        # and verify that "absolute black" (0,0,0) becomes 0 alpha.
        
        new_alpha = max_channel
        
        # Clip to 255
        new_alpha = np.clip(new_alpha, 0, 255)
        
        # Update alpha channel
        data[:,:,3] = new_alpha
        
        # Optional: Normalize color channels to compensate for transparency?
        # For Additive (screen-like) blending, preserving original RGB is usually correct
        # if using pre-multiplied logic, but standard PNG is non-premultiplied.
        # To avoid "dark fringes", we might want to boost RGB where alpha is low?
        # For simplicity and safety with Gold/Silver gradients, keeping RGB as is 
        # while dropping Alpha produces a "Glow" effect which looks great for this brand.
        
        result = Image.fromarray(data.astype(np.uint8))
        result.save(output_path, "PNG")
        print(f"Saved to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

clean_transparency("public/logo-black.png", "public/logo-final.png")
