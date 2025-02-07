import json
import requests
import xml.etree.ElementTree as ET
from tqdm import tqdm

def extract_coordinates_from_gpx(gpx_content):
    """Extracts the first latitude and longitude from a GPX content."""
    try:
        root = ET.fromstring(gpx_content)
    except ET.ParseError:
        return None, None

    # Define namespace for GPX parsing
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}
    
    # Find the first track point
    trkpt = root.find('.//gpx:trkpt', ns)
    if trkpt is not None:
        return trkpt.get('lat'), trkpt.get('lon')
    return None, None

def process_tours(input_file, output_file):
    """Main processing function"""
    with open(input_file, 'r') as f:
        tours = json.load(f)

    updated_tours = []
    for tour in tqdm(tours, desc="Processing Tours", unit="tour"):
        real_tour_id = tour.get('real_tour_id')
        if not real_tour_id:
            print(f"Skipping tour {tour.get('tour_id')} - no real_tour_id")
            continue

        # Fetch GPX file
        url = f"https://api-oa.com/download.tour.gpx?i={real_tour_id}&project=api-dev-oa&key=yourtest-outdoora-ctiveapi"
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Failed to fetch GPX for {real_tour_id}: {e}")
            continue

        # Parse coordinates from GPX
        lat, lon = extract_coordinates_from_gpx(response.content)
        if lat and lon:
            tour['latitude'] = lat
            tour['longitude'] = lon
            updated_tours.append(tour)
        else:
            print(f"No coordinates found for {real_tour_id}")

    # Save updated JSON
    with open(output_file, 'w') as f:
        json.dump(updated_tours, f, indent=2)

if __name__ == '__main__':
    process_tours('final_data_multi.json', 'final_data_multi_lat.json')
