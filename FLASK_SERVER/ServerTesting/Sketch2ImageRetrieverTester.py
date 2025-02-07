import requests
import base64

# Convert sketch to base64
with open('../../new_idea/tsbir/sketches/image.png', 'rb') as f:
    sketch_base64 = base64.b64encode(f.read()).decode()

# Prepare request
data = {
    'sketch': sketch_base64,
    'caption': 'water body'
}

# Send request
response = requests.post('http://localhost:5000/Sketch2ImageRetriever', json=data)
results = response.json()

# Process results
for result in results['results']:
    print(f"URL: {result['url']}")
    print(f"Similarity: {result['similarity']}")
    print(f"Caption: {result['caption']}")
    print("---")