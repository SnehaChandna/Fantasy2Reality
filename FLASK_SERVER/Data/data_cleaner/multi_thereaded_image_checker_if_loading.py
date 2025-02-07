import requests
from tqdm import tqdm
import json
import concurrent.futures

def is_url_accessible(url):
    try:
        response = requests.head(url, allow_redirects=True, timeout=10)
        return response.status_code == 200
    except requests.RequestException:
        return False

def replace_resolution(url, new_res):
    return url.replace('320x320c', new_res)

RESOLUTIONS = [
    'c',
    '1920x1080c',
    '1280x720c',
    '1024x768c',
    '800x600c',
    '640x480c',
    '320x320c'
]

def clean_images(images):
    cleaned = []
    for img in images:
        original_url = img.get('url', '')
        best_url = None
        for res in RESOLUTIONS:
            new_url = replace_resolution(original_url, res)
            if is_url_accessible(new_url):
                best_url = new_url
                break
        if best_url:
            img['url'] = best_url
            cleaned.append(img)
    return cleaned

def clean_cover_image(cover_img, cleaned_images, map_url):
    original_url = cover_img.get('url', '')
    if 'staticmap' in original_url:
        return cover_img
    
    best_url = None
    for res in RESOLUTIONS:
        new_url = replace_resolution(original_url, res)
        if is_url_accessible(new_url):
            best_url = new_url
            break
    
    if best_url:
        cover_img['url'] = best_url
    else:
        cover_img['url'] = cleaned_images[0]['url'] if cleaned_images else map_url
    return cover_img

def process_tour(tour):
    cleaned_images = clean_images(tour.get('images', []))
    tour['images'] = cleaned_images
    
    if 'cover_image' in tour and tour['cover_image']:
        tour['cover_image'] = clean_cover_image(
            tour['cover_image'],
            cleaned_images,
            tour.get('map_url', '')
        )
    return tour

# Load tour data
tour_data_path = "/home/student1/langchain/testing/server/Data/transformed_tour_data.json"
with open(tour_data_path, 'r', encoding='utf-8') as f:
    tour_data = json.load(f)

# Process all tours concurrently with ThreadPoolExecutor
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    tours = list(tqdm(
        executor.map(process_tour, tour_data),
        total=len(tour_data),
        desc="Processing Tours"
    ))

# Save the processed data
output_file = "/home/student1/langchain/testing/server/Data/final_data_multi.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(tour_data, f, indent=4)

print(f"Transformed data saved to {output_file}")
print(f"Total tours processed: {len(tours)}")