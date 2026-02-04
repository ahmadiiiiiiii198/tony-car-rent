from PIL import Image
import numpy as np

def remove_checkerboard(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = np.array(img)
    
    # Get colors from the four corners to identify the background pattern
    corner_colors = [
        tuple(datas[0, 0]),
        tuple(datas[0, -1]),
        tuple(datas[-1, 0]),
        tuple(datas[-1, -1])
    ]
    
    # Threshold for color matching
    threshold = 30
    
    # Create mask for transparency
    mask = np.zeros(datas.shape[:2], dtype=bool)
    
    # For each pixel, check if it matches any of the corner colors
    for color in corner_colors:
        # Calculate distance to corner color
        dist = np.sqrt(np.sum((datas[:, :, :3] - color[:3]) ** 2, axis=2))
        mask |= (dist < threshold)

    # Apply transparency
    datas[mask] = [0, 0, 0, 0]
    
    # Save result
    result = Image.fromarray(datas)
    result.save(output_path, "PNG")
    print(f"Processed image saved to {output_path}")

remove_checkerboard("public/logo-new.png", "public/logo-new.png")
