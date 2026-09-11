import sys
import numpy as np
from PIL import Image
import os
from scipy.ndimage import label

def build_perfect_bamboo(input_path, output_dir):
    print(f"Loading {input_path}")
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    # Remove white background
    white_mask = (r > 240) & (g > 240) & (b > 240)
    data[white_mask, 3] = 0
    
    alpha_mask = data[:,:,3] > 50
    labeled, num_features = label(alpha_mask)
    
    row_has_content = np.any(alpha_mask, axis=1)
    if not np.any(row_has_content):
        print("No content found!")
        return
        
    bottom_y = np.where(row_has_content)[0][-1]
    
    slice_mask = alpha_mask[max(0, bottom_y - 20) : max(0, bottom_y - 2), :]
    col_has_content = np.any(slice_mask, axis=0)
    
    padded = np.pad(col_has_content, (1, 1), 'constant', constant_values=False)
    transitions = np.diff(padded.astype(int))
    starts = np.where(transitions == 1)[0]
    ends = np.where(transitions == -1)[0]
    
    pots = list(zip(starts, ends))
    pots = [p for p in pots if (p[1] - p[0]) > 5]
    if len(pots) > 10:
        pots.sort(key=lambda p: p[1] - p[0], reverse=True)
        pots = pots[:10]
        pots.sort(key=lambda p: p[0])
        
    centers = [(start + end) // 2 for start, end in pots]
    
    pot_labels = []
    for cx in centers:
        # Sample label at a few pixels above the very bottom to avoid shadow gaps
        lbl = labeled[bottom_y - 10, cx]
        pot_labels.append(lbl)
        
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    plants = []
    pot_image = None
    
    # EXTRACT THE POT FROM STAGE 1 (index 0)
    if not pot_labels:
        print("No pots found!")
        return
        
    lbl_1 = pot_labels[0]
    plant_mask_1 = (labeled == lbl_1)
    r_row_1 = np.any(plant_mask_1, axis=1)
    r_col_1 = np.any(plant_mask_1, axis=0)
    endY_1 = np.where(r_row_1)[0][-1] + 1
    startX_1 = np.where(r_col_1)[0][0]
    endX_1 = np.where(r_col_1)[0][-1] + 1
    
    # We don't know the exact pixel height of the bamboo pot yet. 
    # Let's dynamically find it for stage 1!
    comp_mask_1 = plant_mask_1[np.where(r_row_1)[0][0]:endY_1, startX_1:endX_1]
    col_sums_1 = np.sum(comp_mask_1, axis=1)
    
    search_start_1 = max(0, comp_mask_1.shape[0] - 80)
    pot_top_local_1 = comp_mask_1.shape[0] - 30 # default
    for y in range(search_start_1, comp_mask_1.shape[0]):
        if col_sums_1[y] > 50:
            pot_top_local_1 = y
            break
            
    pot_startY = np.where(r_row_1)[0][0] + pot_top_local_1
    
    pot_mask = plant_mask_1[pot_startY:endY_1, startX_1:endX_1]
    pot_data = data[pot_startY:endY_1, startX_1:endX_1]
    pot_sprite_data = np.zeros((endY_1 - pot_startY, endX_1 - startX_1, 4), dtype=np.uint8)
    pot_sprite_data[pot_mask] = pot_data[pot_mask]
    
    p_alpha = pot_sprite_data[:, :, 3] > 0
    p_r_col = np.any(p_alpha, axis=0)
    p_startX = np.where(p_r_col)[0][0]
    p_endX = np.where(p_r_col)[0][-1] + 1
    pot_image = Image.fromarray(pot_sprite_data).crop((p_startX, 0, p_endX, pot_sprite_data.shape[0]))
    
    for i, lbl in enumerate(pot_labels):
        plant_mask = (labeled == lbl).copy()
        
        r_row = np.any(plant_mask, axis=1)
        r_col = np.any(plant_mask, axis=0)
        
        startY = np.where(r_row)[0][0]
        endY = np.where(r_row)[0][-1] + 1
        startX = np.where(r_col)[0][0]
        endX = np.where(r_col)[0][-1] + 1
        
        comp_mask = plant_mask[startY:endY, startX:endX]
        col_sums = np.sum(comp_mask, axis=1)
        
        search_start = max(0, comp_mask.shape[0] - 80)
        pot_top_local = comp_mask.shape[0]
        for y in range(search_start, comp_mask.shape[0]):
            if col_sums[y] > 50:
                pot_top_local = y
                break
                
        global_pot_top = startY + pot_top_local
        # Leave 2 pixels of pot attached to trunk to ensure overlap
        trunk_endY = global_pot_top + 2
        if trunk_endY > endY:
            trunk_endY = endY
            
        local_mask = plant_mask[startY:trunk_endY, startX:endX]
        local_data = data[startY:trunk_endY, startX:endX]
        
        sprite_data = np.zeros((trunk_endY - startY, endX - startX, 4), dtype=np.uint8)
        sprite_data[local_mask] = local_data[local_mask]
        
        sprite = Image.fromarray(sprite_data)
        
        s_alpha = sprite_data[:, :, 3] > 0
        if not np.any(s_alpha):
            continue
            
        s_r_col = np.any(s_alpha, axis=0)
        s_startX = np.where(s_r_col)[0][0]
        s_endX = np.where(s_r_col)[0][-1] + 1
        
        sprite = sprite.crop((s_startX, 0, s_endX, sprite.height))
        
        local_cx = centers[i] - startX - s_startX
        plants.append((sprite, local_cx))

    if not plants:
        print("No plants extracted!")
        return

    max_w_left = max(local_cx for _, local_cx in plants)
    max_w_right = max(plant.width - local_cx for plant, local_cx in plants)
    max_plant_w = max_w_left + max_w_right
    max_plant_h = max(plant.height for plant, _ in plants)
    
    canvas_size_w = int(max(max_plant_w, pot_image.width) * 1.05)
    canvas_size_h = int((max_plant_h + pot_image.height) * 1.05)
    canvas_center_x = canvas_size_w // 2
    
    pot_x = canvas_center_x - (pot_image.width // 2)
    pot_y = canvas_size_h - pot_image.height - int(canvas_size_h * 0.02)
    
    for i, (plant, local_cx) in enumerate(plants):
        canvas = Image.new("RGBA", (canvas_size_w, canvas_size_h), (0, 0, 0, 0))
        
        # Paste pot FIRST
        canvas.paste(pot_image, (pot_x, pot_y), pot_image)
        
        # Paste plant OVER pot
        plant_x = canvas_center_x - local_cx
        plant_y = pot_y - plant.height + 2
        
        canvas.paste(plant, (plant_x, plant_y), plant)
        
        out_path = os.path.join(output_dir, f"bamboo{i+1}.png")
        canvas.save(out_path)
        print(f"Saved {out_path} (width: {canvas_size_w}, height: {canvas_size_h})")

if __name__ == "__main__":
    build_perfect_bamboo(sys.argv[1], sys.argv[2])
