from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    # Create a new image with a blue background
    image = Image.new('RGB', (size, size), '#1a73e8')
    draw = ImageDraw.Draw(image)
    
    # Calculate font size (60% of icon size)
    font_size = int(size * 0.6)
    try:
        font = ImageFont.truetype('Arial', font_size)
    except:
        # Fallback to default font if Arial is not available
        font = ImageFont.load_default()
    
    # Draw the letter J in white
    text = 'J'
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    draw.text((x, y), text, fill='white', font=font)
    
    # Save the icon
    image.save(f'icon{size}.png')

# Generate icons for all required sizes
for size in [16, 48, 128]:
    create_icon(size)
