from PIL import Image, ImageDraw, ImageFont
import os

def create_terminal_window(input_image_path, output_image_path, title="pong-game ~/preview"):
    # Open the input image
    content_img = Image.open(input_image_path)
    
    # Define colors
    bg_color = (46, 46, 46)  # Dark gray background
    header_color = (30, 30, 30)  # Even darker for header
    
    # Define dimensions
    padding = 20
    header_height = 40
    window_width = content_img.width + (padding * 2)
    window_height = content_img.height + header_height + (padding * 2)
    corner_radius = 10
    
    # Create the base image with some padding for shadow
    shadow_padding = 40
    base = Image.new('RGBA', (window_width + shadow_padding, window_height + shadow_padding), (0, 0, 0, 0))
    
    # Create the main window
    window = Image.new('RGBA', (window_width, window_height), bg_color)
    
    # Create a mask for rounded corners
    mask = Image.new('L', (window_width, window_height), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (window_width, window_height)], corner_radius, fill=255)
    
    # Apply the mask
    window.putalpha(mask)
    
    # Create shadow
    shadow = Image.new('RGBA', (window_width, window_height), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle([(0, 0), (window_width, window_height)], corner_radius, fill=(0, 0, 0, 80))
    
    # Apply blur to shadow (approximation by expanding slightly)
    shadow_expanded = Image.new('RGBA', (window_width + 10, window_height + 10), (0, 0, 0, 0))
    shadow_expanded_draw = ImageDraw.Draw(shadow_expanded)
    shadow_expanded_draw.rounded_rectangle([(5, 5), (window_width + 5, window_height + 5)], corner_radius + 5, fill=(0, 0, 0, 60))
    
    # Draw the header
    draw = ImageDraw.Draw(window)
    draw.rectangle([(0, 0), (window_width, header_height)], fill=header_color)
    
    # Draw the buttons
    button_radius = 6
    button_margin = 8
    button_y = header_height // 2
    
    # Red button (close)
    button1_x = padding
    draw.ellipse([(button1_x - button_radius, button_y - button_radius), 
                 (button1_x + button_radius, button_y + button_radius)], fill=(255, 95, 86))
    
    # Yellow button (minimize)
    button2_x = button1_x + (button_radius * 2) + button_margin
    draw.ellipse([(button2_x - button_radius, button_y - button_radius), 
                 (button2_x + button_radius, button_y + button_radius)], fill=(255, 189, 46))
    
    # Green button (maximize)
    button3_x = button2_x + (button_radius * 2) + button_margin
    draw.ellipse([(button3_x - button_radius, button_y - button_radius), 
                 (button3_x + button_radius, button_y + button_radius)], fill=(39, 201, 63))
    
    # Draw the title
    try:
        # Try to load a monospace font
        font = ImageFont.truetype("Menlo.ttf", 12)  # Mac
    except IOError:
        try:
            font = ImageFont.truetype("DejaVuSansMono.ttf", 12)  # Linux
        except IOError:
            try:
                font = ImageFont.truetype("Consolas", 12)  # Windows
            except IOError:
                font = ImageFont.load_default()
    
    title_width = draw.textlength(title, font=font)
    title_x = (window_width - title_width) // 2
    title_y = (header_height - 12) // 2
    draw.text((title_x, title_y), title, fill=(200, 200, 200), font=font)
    
    # Add the content image
    window.paste(content_img, (padding, header_height + padding))
    
    # Paste shadow onto base image with offset
    shadow_offset = 10
    base.paste(shadow_expanded, (shadow_offset, shadow_offset), shadow_expanded)
    
    # Paste window onto base image
    base.paste(window, (0, 0), window)
    
    # Save the result
    base.save(output_image_path)
    print(f"Terminal window image saved to {output_image_path}")

# Usage
create_terminal_window(r"C:\Users\yvann\Pictures\Screenshots\Screenshot 2025-04-11 082950.png", 
                      r"C:\Users\yvann\Desktop\Cursor\ft_transcendence\frontend\public\assets\readme\HomePage.png")
