import json
from collections import defaultdict

def transform_tour_data(input_file: str, output_file: str) -> None:
    """
    Transform tour data by adding a sequential 'tour_id' 
    while preserving the original value in 'real_tour_id'.
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        tour_data = json.load(f)

    # Check for duplicate real_tour_id values
    id_counter = defaultdict(int)
    for tour in tour_data:
        original_id = tour['tour_id']
        # Convert to string to handle any type consistently
        id_counter[str(original_id)] += 1

    duplicates = {k for k, v in id_counter.items() if v > 1}
    if duplicates:
        print("Duplicate real_tour_id values found:")
        for dup in duplicates:
            print(f"ID: {dup} appears {id_counter[dup]} times")
    else:
        print("All real_tour_id values are unique")

    # Transform data - ensure real_tour_id preserves original type
    for idx, tour in enumerate(tour_data):
        original_id = tour['tour_id']
        tour['real_tour_id'] = original_id  # preserve original type
        tour['tour_id'] = idx + 1  # new sequential ID

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(tour_data, f, indent=4)

    print(f"Transformed data saved to {output_file}")
    print(f"Total tours processed: {len(tour_data)}")

def verify_transformation(file_path: str) -> None:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\nVerification Results:")
    print(f"Total tours: {len(data)}")
    
    # Check first 5 entries
    for tour in data[:5]:
        print(f"\nTour ID: {tour['tour_id']}")
        print(f"Real Tour ID: {tour['real_tour_id']} (Type: {type(tour['real_tour_id'])})")
        
        assert isinstance(tour['real_tour_id'], (int, str)), \
            "real_tour_id should be int or string"
        assert isinstance(tour['tour_id'], int), \
            "tour_id must be integer"

    print("\nVerification successful!")

def main():
    input_file = './tour_data.json'
    output_file = './transformed_tour_data.json'
    
    transform_tour_data(input_file, output_file)
    verify_transformation(output_file)

if __name__ == "__main__":
    main()