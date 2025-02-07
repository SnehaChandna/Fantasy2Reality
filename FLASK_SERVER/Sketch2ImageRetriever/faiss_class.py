import faiss
import numpy as np
from pathlib import Path
import json
import pickle

class FaissMetadataIndex:
    """
    Enhanced FAISS index that stores both embeddings and complete image metadata.
    Supports efficient similarity search while maintaining all associated image information.
    """
    def __init__(self, dimension=512):
        # Initialize FAISS index for embeddings
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        
        # Store for image metadata
        self.metadata = []
        
        # Enable GPU if available
        if faiss.get_num_gpus() > 0:
            print("Using GPU for FAISS")
            self.index = faiss.index_cpu_to_gpu(
                faiss.StandardGpuResources(), 0, self.index)
    
    def add_embeddings(self, embeddings, metadata_list):
        """
        Add embeddings and their complete metadata to the index individually
        
        Args:
            embeddings: numpy array of embeddings
            metadata_list: list of dictionaries containing image metadata
        """
        # Ensure embeddings are numpy array with float32 type
        embeddings = np.array(embeddings).astype('float32')
        
        # Verify matching lengths
        if len(embeddings) != len(metadata_list):
            raise ValueError(f"Number of embeddings ({len(embeddings)}) must match number of metadata entries ({len(metadata_list)})")
        
        # Add embeddings and metadata individually
        for i, (embedding, metadata) in enumerate(zip(embeddings, metadata_list)):
            # Reshape single embedding to 2D array as required by FAISS
            embedding_2d = embedding.reshape(1, -1)
            
            # Add single embedding to FAISS index
            self.index.add(embedding_2d)
            
            # Add corresponding metadata
            self.metadata.append(metadata)
        
        print(f"Added {len(metadata_list)} items. Total items: {len(self.metadata)}")
    
    def search(self, query_embedding, k=10):
        """
        Search for similar images and return their complete metadata
        
        Returns:
            List of tuples: (metadata_dict, similarity_score)
        """
        query_embedding = np.array(query_embedding).astype('float32')
        if len(query_embedding.shape) == 1:
            query_embedding = query_embedding.reshape(1, -1)
            
        distances, indices = self.index.search(query_embedding, k)
        
        # Return complete metadata for each match
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.metadata):  # Ensure valid index
                results.append({
                    'metadata': self.metadata[idx],
                    'similarity': float(dist)
                })
        
        return results
    
    def save(self, save_dir):
        """Save both the FAISS index and metadata"""
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # Save FAISS index
        if faiss.get_num_gpus() > 0:
            index_cpu = faiss.index_gpu_to_cpu(self.index)
        else:
            index_cpu = self.index
        faiss.write_index(index_cpu, str(save_dir / 'faiss.index'))
        
        # Save metadata using pickle for complex data structures
        with open(save_dir / 'metadata.pkl', 'wb') as f:
            pickle.dump(self.metadata, f)
            
        print(f"Saved index and metadata for {len(self.metadata)} items to {save_dir}")
    
    @classmethod
    def load(cls, save_dir):
        """Load saved index and metadata"""
        save_dir = Path(save_dir)
        instance = cls()
        
        # Load FAISS index
        print("---"*10,str(save_dir / 'faiss.index'))
        instance.index = faiss.read_index(str(save_dir / 'faiss.index'))
        if faiss.get_num_gpus() > 0:
            instance.index = faiss.index_cpu_to_gpu(
                faiss.StandardGpuResources(), 0, instance.index)
        
        # Load metadata
        with open(save_dir / 'metadata.pkl', 'rb') as f:
            instance.metadata = pickle.load(f)
            
        print(f"Loaded index and metadata for {len(instance.metadata)} items from {save_dir}")
        return instance