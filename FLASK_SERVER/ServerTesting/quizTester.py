import requests
import json
import base64
from pathlib import Path

def test_quiz_endpoint():
    url = "http://localhost:5000/quiz"
    
    # Example data
    payload = {
        "liked_tours": ["24503557", "24503556"],
        "disliked_tours": ["802465378"]
    }
    
    try:
        response = requests.post(url, json=payload)
        print("\nQuiz Endpoint Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error calling quiz endpoint: {str(e)}")

def test_sketch_endpoint():
    url = "http://localhost:5000/Sketch2ImageRetriever"
    
    try:
        # Load a sample sketch ic:\Users\CHETAN~1\AppData\Local\Temp\images.jpgmage (assuming you have one)
        image_path = Path("images.jpg")  # Replace with your image path
        
        # Read and encode the image
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Example payload
        payload = {
            "sketch": encoded_string,
            "caption": "mountain"
        }
        
        response = requests.post(url, json=payload)
        print("\nSketch Endpoint Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error calling sketch endpoint: {str(e)}")

if __name__ == "__main__":
    # Test quiz endpoint
    test_quiz_endpoint()
    
    # Test sketch endpoint
    test_sketch_endpoint()