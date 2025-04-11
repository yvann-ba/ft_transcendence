from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# ===== PARAMETERS TO MODIFY =====
# Rounded corners parameters
CORNER_RADIUS = 60  # Radius of rounded corners (in pixels)

# Shadow parameters
SHADOW_COLOR = (0, 0, 0, 250)  # Shadow color (R,G,B,A) - A=250 for 98% opacity
SHADOW_BLUR = 45  # Shadow blur intensity (in pixels)
SHADOW_SPREAD = 40  # Shadow spread around the image (in pixels)

INPUT_IMAGE = 'frontend/public/assets/readme/HomePage2.png'  # Source image
OUTPUT_IMAGE = 'frontend/public/assets/readme/homepage2_process.png'  # Output image
# ================================

def add_rounded_corners(image, radius):
    # Create a mask with rounded corners
    mask = Image.new('L', image.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), image.size], radius, fill=255)
    
    # Create output image
    output = Image.new('RGBA', image.size, (0, 0, 0, 0))
    output.paste(image, (0, 0))
    output.putalpha(mask)
    return output

def add_drop_shadow(image, shadow_color=SHADOW_COLOR, shadow_blur=SHADOW_BLUR, shadow_spread=SHADOW_SPREAD):
    # Create a larger canvas to accommodate the shadow
    padding = shadow_spread + shadow_blur
    shadow_size = (image.size[0] + padding * 2, image.size[1] + padding * 2)
    
    # Create shadow layer
    shadow = Image.new('RGBA', shadow_size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    
    # Draw shadow with rounded corners
    shadow_draw.rounded_rectangle(
        [(padding, padding),
         (padding + image.size[0], padding + image.size[1])],
        CORNER_RADIUS,  # Utilise le même rayon que les coins de l'image
        fill=shadow_color
    )
    
    # Blur the shadow
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_blur))
    
    # Create final image
    result = Image.new('RGBA', shadow_size, (0, 0, 0, 0))
    
    # Paste shadow first
    result.paste(shadow, (0, 0), shadow)
    
    # Paste original image on top
    result.paste(image, (padding, padding), image)
    
    return result

def process_image(input_path, output_path):
    # Open the image
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Add rounded corners
    rounded_img = add_rounded_corners(img, radius=CORNER_RADIUS)
    
    # Add drop shadow
    final_img = add_drop_shadow(rounded_img)
    
    # Save the result
    final_img.save(output_path, 'PNG')
    print(f"Image traitée avec succès ! Sauvegardée sous : {output_path}")

if __name__ == "__main__":
    process_image(INPUT_IMAGE, OUTPUT_IMAGE) 