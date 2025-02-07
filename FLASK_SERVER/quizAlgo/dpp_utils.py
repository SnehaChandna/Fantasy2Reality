import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.metrics import pairwise_distances
from dppy.finite_dpps import FiniteDPP

class DPPRecommender:
    def __init__(self, embeddings: Dict[int, np.ndarray], tour_metadata: Dict[int, Dict]):
        """
        
        Initialize DPP recommender with tour embeddings and metadata.
        
        Parameters:
        -----------
        embeddings : Dict[int, np.ndarray]
            Dictionary mapping tour IDs to their embeddings
        tour_metadata : Dict[int, Dict]
            Dictionary mapping tour IDs to their metadata
        """
        self.embeddings = embeddings
        self.tour_metadata = tour_metadata
        self.embedding_matrix = np.stack(list(embeddings.values()))  #each row represents an embedding vector   
        self.tour_ids = list(embeddings.keys())
        """
            _summary_
            DPP algorithms typically operate on a matrix representation of the items (in this case, tours). 
            This matrix is often called a kernel matrix or a similarity matrix. The elements of this matrix 
            represent the similarities (or distances) between pairs of items.
            To compute this similarity matrix, you need the embedding vectors to be organized in a matrix format. 
            np.stack efficiently transforms the collection of individual embedding vectors (from the embeddings dictionary) 
            into this required matrix format (self.embedding_matrix).
        """
    
    def compute_similarity_matrix(
        self, 
        positive_ids: Optional[List[int]] = None, 
        negative_ids: Optional[List[int]] = None,
        gamma: float = 0.1, 
        attract_beta: float = 0.5, 
        repel_beta: float = 0.3
    ) -> np.ndarray:
        """
        Compute similarity matrix with dual influence from positive and negative examples.
        Handles empty ID lists gracefully.
        
        Parameters:
        -----------
        positive_ids : List[str], optional
            IDs of items to be attracted to
        negative_ids : List[str], optional
            IDs of items to be repelled from
        gamma : float
            Base kernel bandwidth parameter
            
            ->>>#### A smaller gamma means that the similarity between two items decreases 
                #### more slowly as their distance in the embedding space increases. A larger
                ####  gamma means the similarity decreases more quickly with distance. 
                #### In simpler terms, it determines how far the influence of a single data point extends.
            
            
        attract_beta : float
            Strength of attraction
            #TODO: write what happens if i increase this
            
        repel_beta : float
            Strength of repulsion
            #TODO: write what happens if i increase this
            

        Returns:
        --------
        np.ndarray
            Modified similarity matrix
        """
        positive_ids = positive_ids or []
        negative_ids = negative_ids or []
        
        # Initialize weights
        attraction_weights = np.ones(len(self.embedding_matrix))
        repulsion_weights = np.ones(len(self.embedding_matrix))
        

        """
            *Summary*:
            This code snippet calculates "attraction weights" for each tour based on its distance to positive example tours.  For each positive example embedding (pos_emb):

                It computes the Euclidean distance between that pos_emb and every tour embedding in self.embedding_matrix.
                It converts these distances into weights using a Gaussian-like function: weights = np.exp(-attract_beta * distances**2). This assigns higher weights to tours closer to the pos_emb.
                It updates the attraction_weights by multiplying them by (1 + weights). This increases the attraction_weights of tours that are close to the positive example. The process is repeated for all the pos_emb in positive_embeddings

            *Role of attract_beta*:
            The attract_beta parameter controls the strength of the attraction and the rate at which the attraction weights decay with distance.

                Higher attract_beta: Leads to a stronger attraction effect. The weights will be more concentrated on tours very close to the positive examples, and they will decrease rapidly as the distance increases (because they are in the power of -ve e).
                Lower attract_beta: Leads to a weaker and more spread-out attraction effect. Tours farther away from the positive examples will still receive some non-negligible increase in their attraction_weights.

            In essence, attract_beta acts as a scaling factor in the exponential function, determining the "spread" or "bandwidth" of the attraction influence. It dictates how quickly the influence of a positive example diminishes as you move away from it in the embedding space. This can be added to the code base:
        """

        if positive_ids:
            positive_embeddings = np.stack([self.embeddings[pid] for pid in positive_ids])
            for pos_emb in positive_embeddings:
                distances = np.linalg.norm(self.embedding_matrix - pos_emb, axis=1)
                weights = np.exp(-attract_beta * distances**2)
                attraction_weights *= (1 + weights)
        
        """
            similar to attract_beta we have a repel beta which redduces the weight 
            if the repel_beta is high then we have more concentrated arround the neggetive point and we penalize less the point that is farther away
            and if we decrease the attract_beta then the same point will have 
        """
        if negative_ids:
            negative_embeddings = np.stack([self.embeddings[pid] for pid in negative_ids])
            for neg_emb in negative_embeddings:
                distances = np.linalg.norm(self.embedding_matrix - neg_emb, axis=1)
                weights = np.exp(-repel_beta * distances**2)
                repulsion_weights *= (1 - weights)
        
        # Combine weights
        total_weights = attraction_weights * repulsion_weights
        
        # Handle normalization when all weights are the same
        weights_min = total_weights.min()
        weights_max = total_weights.max()
        if np.isclose(weights_min, weights_max):
            """
               This condition checks if the minimum and maximum weights are very 
               close to each other using np.isclose(). This is important because 
               if all weights are nearly identical, normalizing them using the standard 
               formula could lead to division by a very small number or zero, causing 
               numerical instability or errors 
            """
            normalized_weights = np.ones_like(total_weights)
        else:
            normalized_weights = (total_weights - weights_min) / (weights_max - weights_min)
        
        # Compute base similarity matrix
        """
            What it does: This line transforms the distances into similarities using a Gaussian (RBF) kernel.
            Gaussian Kernel: The formula exp(-gamma * distance^2) is the core of the Gaussian or Radial Basis Function (RBF) kernel. It's a common way to convert distances into similarity scores.
                Distance = 0: If two items are at the same location (distance = 0), the similarity is exp(0) = 1 (maximum similarity).
                    Distance Increases: As the distance between two items increases, the value of -gamma * distance^2 becomes more negative, and exp() of that value approaches 0. Thus, similarity decreases exponentially with distance.

                Role of gamma: The gamma parameter controls how quickly the similarity decreases with distance.

                    Larger gamma: Similarity decreases more rapidly. Only very close items will have a significant similarity score.
                    Smaller gamma: Similarity decreases more slowly. Items farther apart will still have some non-negligible similarity.
        """
        pairwise_distances_matrix = pairwise_distances(self.embedding_matrix, metric="euclidean")
        base_similarity = np.exp(-gamma * pairwise_distances_matrix**2)
        
        # Modified kernel incorporating both influences symmetrically
        weight_products = np.sqrt(normalized_weights[:, np.newaxis] * normalized_weights[np.newaxis, :])
        similarity_matrix = base_similarity * weight_products
        
        # Ensure numerical stability and symmetry
        similarity_matrix = (similarity_matrix + similarity_matrix.T) / 2
        
        # Ensure PSD property
        """positive semidefinate is required by many graph algorithms so that is why we clip teh negetive eighen values an donly the positive remain and then
        we reconstruct using psd_matrix"""
        eig_vals, eig_vecs = np.linalg.eigh(similarity_matrix)
        eig_vals_clipped = np.clip(eig_vals, 0, None)
        psd_matrix = eig_vecs @ np.diag(eig_vals_clipped) @ eig_vecs.T
        
        return psd_matrix
    
    def recommend(self, 
    positive_ids: Optional[List[int]] = None, 
    negative_ids: Optional[List[int]] = None, 
    k: int = 5,
    gamma: float = 0.1,
    attract_beta: float = 0.5,
    repel_beta: float = 0.3,
    include_embeddings: bool = True
) -> Dict:
        """
        Generate recommendations using DPP sampling.
        
        Parameters:
        -----------
        [previous parameters...]
        include_embeddings : bool
            Whether to include embeddings in the response

        Returns:
        --------
        Dict
            Dictionary containing recommendations and their embeddings
        """
        # Compute similarity matrix
        kernel_matrix = self.compute_similarity_matrix(
            positive_ids, 
            negative_ids, 
            gamma=gamma, 
            attract_beta=attract_beta, 
            repel_beta=repel_beta
        )
        
        # Sample from DPP
        dpp = FiniteDPP(kernel_type='likelihood', L=kernel_matrix)
        dpp.sample_exact_k_dpp(size=k)
        selected_indices = dpp.list_of_samples[0]
        
        # Get selected tour IDs and metadata
        selected_tours = [self.tour_ids[i] for i in selected_indices]
        recommendations = [
            {
                'tour_id': tour_id,
                **self.tour_metadata[tour_id]
            }
            for tour_id in selected_tours
        ]
        
        # Include embeddings if requested
        response = {
            'recommendations': recommendations
        }
        
        if include_embeddings:
            embeddings_dict = {
                tour_id: self.embeddings[tour_id].tolist()  # Convert numpy array to list for JSON serialization
                for tour_id in selected_tours
            }
            response['embeddings'] = embeddings_dict
        
        return response