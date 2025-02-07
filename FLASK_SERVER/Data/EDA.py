import json
from collections import Counter

def analyze_tours(tour_data):
    total_tours = len(tour_data)
    
    # Route Type Count
    route_type_count = Counter(tour["route_type"] for tour in tour_data if "route_type" in tour)
    
    # Count empty fields
    empty_title_count = sum(1 for tour in tour_data if not tour.get("title"))
    empty_short_desc_count = sum(1 for tour in tour_data if not tour.get("short_description"))
    empty_long_desc_count = sum(1 for tour in tour_data if not tour.get("long_description"))
    
    # Difficulty Count (Replace empty difficulty with 'unrated')
    for tour in tour_data:
        if "difficulty" in tour and not tour["difficulty"]:
            tour["difficulty"] = "unrated"
    difficulty_count = Counter(tour["difficulty"] for tour in tour_data if "difficulty" in tour)
    
    # Missing latitude & longitude
    missing_lat_lon_count = sum(1 for tour in tour_data if not tour.get("latitude") or not tour.get("longitude"))
    
    # Compute percentages
    def compute_percentage(count):
        return round((count / total_tours) * 100, 2) if total_tours > 0 else 0
    
    print("Route Type Distribution:")
    for route_type, count in route_type_count.items():
        print(f"{route_type}: {compute_percentage(count)}%")
    
    print("\nEmpty Fields Percentage:")
    print(f"Empty Titles: {compute_percentage(empty_title_count)}%")
    print(f"Empty Short Descriptions: {compute_percentage(empty_short_desc_count)}%")
    print(f"Empty Long Descriptions: {compute_percentage(empty_long_desc_count)}%")
    
    print("\nDifficulty Distribution:")
    for difficulty, count in difficulty_count.items():
        print(f"{difficulty}: {compute_percentage(count)}%")
    
    print("\nPercentage of tours missing latitude or longitude:")
    print(f"{compute_percentage(missing_lat_lon_count)}%")

# Read JSON from file
def read_json_file(filename):
    with open(filename, "r", encoding="utf-8") as file:
        return json.load(file)

# Example usage
if __name__ == "__main__":
    tour_list = read_json_file("final_data_multi_lat.json")
    analyze_tours(tour_list)
