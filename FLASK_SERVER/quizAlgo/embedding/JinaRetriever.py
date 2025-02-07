import torch
import torch
from typing import List, Tuple, Union
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModel


class JinaRetriever:
    """Simple retrieval using Jina CLIP model"""
    def __init__(self, model_name: str = "jinaai/jina-clip-v2", device: str = "cuda" if torch.cuda.is_available() else "cpu"):
        self.device = device
        self.processor = AutoProcessor.from_pretrained(model_name,trust_remote_code=True)
        self.model = AutoModel.from_pretrained(model_name, trust_remote_code=True).to(device)

    def get_text_embeddings(self,
                           texts: Union[str, List[str]],
                           normalize: bool = True,
                           output_dim: int = None) -> torch.Tensor:
        """
        Extract text embeddings from input texts.
        """
        inputs = self.processor(text=texts, return_tensors="pt", padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            text_features = self.model.get_text_features(**inputs)

        if normalize:
            text_features = torch.nn.functional.normalize(text_features, dim=-1)

        if output_dim is not None:
            text_features = text_features[:, :output_dim]

        # Convert to float32 for compatibility
        return text_features.cpu().float()

    def get_image_embeddings(self,
                            images: Union[Image.Image, List[Image.Image]],
                            normalize: bool = True,
                            output_dim: int = None) -> torch.Tensor:
        """
        Extract image embeddings from input images.
        """
        inputs = self.processor(images=images, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            image_features = self.model.get_image_features(**inputs)

        if normalize:
            image_features = torch.nn.functional.normalize(image_features, dim=-1)

        if output_dim is not None:
            image_features = image_features[:, :output_dim]

        # Convert to float32 for compatibility
        return image_features.cpu().float()

    def find_similar_texts(self, query: str, texts: List[str], k: int = 5) -> Tuple[List[str], List[float]]:
        """Find k most similar texts to query"""
        query_embedding = self.get_text_embeddings([query])
        text_embeddings = self.get_text_embeddings(texts)

        similarities = torch.mm(query_embedding, text_embeddings.t()).squeeze()
        top_k = torch.topk(similarities, min(k, len(texts)))

        results = [texts[idx] for idx in top_k.indices]
        scores = top_k.values.tolist()
        return results, scores

    def find_similar_images(self, query: str, images: List[Image.Image], k: int = 5) -> Tuple[List[int], List[float]]:
        """Find k most similar images to text query"""
        query_embedding = self.get_text_embeddings([query])
        image_embeddings = self.get_image_embeddings(images)

        similarities = torch.mm(query_embedding, image_embeddings.t()).squeeze()
        top_k = torch.topk(similarities, min(k, len(images)))

        return top_k.indices.tolist(), top_k.values.tolist()
