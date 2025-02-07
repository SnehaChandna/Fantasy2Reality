from flask import Flask, request, jsonify
import torch
import base64
from PIL import Image
import io
from pathlib import Path
import sys
import json
from .code.clip.model import convert_weights, CLIP
from .code.clip.clip import _transform
from .faiss_class import FaissMetadataIndex

# Global variables for model and index
model = None
faiss_index = None
transformer = None
# Path setup

FAISS_INDEX_PATH = Path('./Sketch2ImageRetriever/faiss_index/')
model_config_file =Path('./Sketch2ImageRetriever/code/training/model_configs/ViT-B-16.json')
model_file = Path('./Sketch2ImageRetriever/model/tsbir_model_final.pt')


def process_sketch(sketch_base64):
    """Convert base64 sketch to PIL Image"""
    sketch_bytes = base64.b64decode(sketch_base64)
    sketch = Image.open(io.BytesIO(sketch_bytes))
    if sketch.mode != 'RGB':
        sketch = sketch.convert('RGB')
    return sketch

def initialize_model():
    """Initialize the model and FAISS index"""
    global model, faiss_index, transformer    
    
    # Initialize model
    gpu = 0
    torch.cuda.set_device(gpu)
    
    with open(model_config_file, 'r') as f:
        model_info = json.load(f)
    
    model = CLIP(**model_info)
    loc = f"cuda:{gpu}"
    checkpoint = torch.load(model_file, map_location=loc)
    sd = checkpoint["state_dict"]
    
    if next(iter(sd.items()))[0].startswith('module'):
        sd = {k[len('module.'):]: v for k, v in sd.items()}
    
    model.load_state_dict(sd, strict=False)
    model.eval()
    model = model.cuda()
    
    # Convert weights and set up transformer
    convert_weights(model)
    transformer = _transform(model.visual.input_resolution, is_train=False)
    
    # Load FAISS index
    faiss_index = FaissMetadataIndex.load(FAISS_INDEX_PATH)
    
    print("Model and index initialized successfully")
    return model, faiss_index, transformer

