from PIL import Image
import numpy as np

def crop_bottom_line(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Get alpha channel
    alpha = data[:,:,3]
    
    # Find bounding box of non-transparent pixels
    rows = np.any(alpha > 0, axis=1)
    cols = np.any(alpha > 0, axis=0)
    
    if not np.any(rows):
        print("Image is empty")
        return

    top, bottom = np.where(rows)[0][[0, -1]]
    left, right = np.where(cols)[0][[0, -1]]
    
    print(f"Content bounds: Top={top}, Bottom={bottom}, Left={left}, Right={right}")
    
    # Scan from bottom of content up to find the "line"
    # A line usually has a very small height compared to width
    
    # We'll inspect the bottom-most connected component
    # For a simple heuristic: if there's a gap of transparency between the bottom stuff and the rest, crop it.
    
    # Let's check for horizontal gaps in the alpha channel within the bounding box
    scan_height = bottom - top
    gap_found = False
    cut_row = bottom
    
    # Search for a gap of at least 5 transparent rows starting from the bottom content
    # We assume the line is at the bottom, then some space, then text.
    
    # Walk upwards from bottom
    empty_rows_count = 0
    in_content = True
    
    # Scan from bottom up
    rect_bottom = bottom
    rect_top = bottom
    
    # Identify the bottom-most block
    for r in range(bottom, top, -1):
        row_has_pixels = rows[r]
        if row_has_pixels:
            if not in_content:
                # We crossed a gap and hit pixels again!
                # This means the previous block was the "line"
                # We should cut below this new block (plus some padding)
                print(f"Found gap between {r} and {rect_top}")
                cut_row = r + 1 # Keep this row (text), cut below
                
                # Check if the block we just skipped (rect_top to rect_bottom) looks like a line
                # Height of block
                block_h = rect_bottom - rect_top
                print(f"Bottom block height: {block_h}")
                
                # If block is small (likely a line), we discard it.
                # If block is huge, maybe we shouldn't have skipped it?
                # But the user wants to remove the 'line', so dropping the bottom-most detached element is a solid guess.
                
                # However, we need to correctly set the crop.
                # We want to crop at `r + empty_rows_count`? No.
                # We want to keep up to `r` (the text).
                
                # Let's verify: The line is the bottom component. 
                # We walked from bottom (line starts), went up (line ends), saw empty rows, saw pixels (text).
                # So we want to crop everything below `r + 1 + padding`.
                
                # Add a little padding if possible, but safely we can just cut at the gap mid-point or just below text.
                cut_row = r + 5 # Keep a few transparent pixels below text
                if cut_row > rect_top: # Only if gap is big enough
                     cut_row = rect_top - 1
                
                break
            rect_top = r
        else:
            in_content = False
            empty_rows_count += 1
            
    # Apply crop
    # Crop box: (left, top, right, bottom)
    # We keep left/right from original, but adjust bottom to `cut_row`
    
    if cut_row < bottom:
        print(f"Cropping at row {cut_row}")
        # Crop: Left, Top, Right, CutRow
        # We assume we want to keep the original canvas width? Or tight crop?
        # User said "weird yellow line", removing it implies tight crop or keeping transparency.
        # Let's do a tight crop on the remaining content for cleanliness.
        
        # Recalculate horizontal bounds for the remaining content
        new_data_subset = data[top:cut_row, :, 3]
        new_rows = np.any(new_data_subset > 0, axis=1)
        new_cols = np.any(new_data_subset > 0, axis=0)
        
        if np.any(new_rows):
            new_bottom = top + np.where(new_rows)[0][-1] + 1
            new_left = np.where(new_cols)[0][0]
            new_right = np.where(new_cols)[0][-1] + 1
            
            # Crop
            res = img.crop((new_left, top, new_right, new_bottom))
            res.save(output_path)
            print("Saved cropped image")
        else:
            print("Crop failed, result empty")
    else:
        print("No gap found to crop line. Trying straight bottom crop of 15%")
        # Manual fallback: Crop bottom 15% of the logical content
        # This is risky but effective if the line is there.
        height_of_content = bottom - top
        cut_row = int(bottom - (height_of_content * 0.15))
        res = img.crop((left, top, right, cut_row))
        res.save(output_path)
        print("Saved forced cropped image")

crop_bottom_line("public/logo-transparent.png", "public/logo-transparent.png")
