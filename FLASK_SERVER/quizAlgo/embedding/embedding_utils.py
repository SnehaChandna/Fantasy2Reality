from typing import List, Dict, Any
import numpy as np
import json
import h5py
from PIL import Image
import requests
from io import BytesIO

class TourEmbeddingHandler_Quiz:
    def __init__(self, retriever,singlePartDim:int=1024):
        self.retriever = retriever
        self.image_DIM=singlePartDim
        self.text_DIM=singlePartDim
        
    def download_and_process_image(self, url: str) -> Image.Image:
        response = requests.get(url)
        return Image.open(BytesIO(response.content))
        
    def process_tour_data(self, tour_data: Dict[int, Any]) -> np.ndarray:
        images = []
        weights = []
        
        # Process cover image with higher weight
        if tour_data.get('cover_image'):
            cover_img = self.download_and_process_image(tour_data['cover_image']['url'])
            images.append(cover_img)
            weights.append(tour_data['cover_image'].get('score', 0.8))
            
        # Process other images
        remaining_weight = (1.0 - weights[0]) / max(1, len(tour_data['images']) - 1)
        for img_data in tour_data['images']:
            if img_data['url'] != tour_data['cover_image']['url']:
                img = self.download_and_process_image(img_data['url'])
                images.append(img)
                weights.append(remaining_weight)
                
        # Get embeddings for all images
        embeddings = self.retriever.get_image_embeddings(images,output_dim=self.image_DIM)
        # print(embeddings.shape)
        # Combine embeddings using weights
        weights = np.array(weights).reshape(-1, 1)
        final_embedding = np.sum(embeddings.numpy() * weights, axis=0)
        return final_embedding

    def save_embeddings(self, embeddings_dict, filename: str):
        with h5py.File(filename, 'w') as f:
            for tour_id, embedding in embeddings_dict.items():
                f.create_dataset(str(tour_id), data=embedding)
                
    def load_embeddings(self, filename: str) -> Dict[int, np.ndarray]:
        embeddings_dict = {}
        with h5py.File(filename, 'r') as f:
            for tour_id in f.keys():
                embeddings_dict[int(tour_id)] = f[tour_id][:]
        return embeddings_dict