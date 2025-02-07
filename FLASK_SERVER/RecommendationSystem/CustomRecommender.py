from typing import Dict, List, Optional
import numpy as np
from annoy import AnnoyIndex
from quizAlgo.embedding.JinaRetriever import JinaRetriever
from PIL import Image
import requests
from io import BytesIO
from tqdm import tqdm
import logging
import sys
import traceback

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tour_recommender_debug.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class ContentBasedTourRecommender:
    def __init__(self, jina_retriever: JinaRetriever, embedding_dim: int = 1024, 
                 initial_threshold: float = 0.5, min_results: int = 20):
        logging.info(f"Initializing ContentBasedTourRecommender with embedding_dim={embedding_dim}")
        self.retriever = jina_retriever
        self.image_dim = embedding_dim  
        self.text_dim = embedding_dim
        self.embedding_dim = self.image_dim + self.text_dim
        self.tour_embeddings = {}
        self.user_embeddings = {}
        try:
            self.annoy_index = AnnoyIndex(self.embedding_dim, 'angular')
            logging.info("Successfully created AnnoyIndex")
        except Exception as e:
            logging.error(f"Failed to create AnnoyIndex: {str(e)}")
            raise

        self.QUERY_WEIGHT = 3
        self.initial_threshold = initial_threshold
        self.min_results = min_results
        self.threshold_steps = [0.5, 0.4, 0.3,0.1]
        self.weights = {
            'liked_weight': 1,
            'disliked_weight': -0.7,
            'rating_scale': 0.8,
            'zero_embedding': np.zeros(self.embedding_dim)
        }

    def load_image_from_url(self, url: str) -> Image.Image:
        """Load image from URL and convert to PIL Image."""
        try:
            logging.debug(f"Attempting to load image from URL: {url}")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            logging.debug("Successfully loaded image")
            return image
        except requests.RequestException as e:
            logging.error(f"Failed to load image from URL {url}: {str(e)}")
            raise
        except Exception as e:
            logging.error(f"Unexpected error loading image from {url}: {str(e)}")
            raise

    def compute_tour_embedding(self, tour_data: Dict) -> np.ndarray:
        """Compute tour embedding by concatenating text and image embeddings."""
        tour_id = tour_data.get('tour_id', 'unknown')
        logging.info(f"Computing embedding for tour_id: {tour_id}")
        
        try:
            # Prepare text content
            text_content = [
                " - TITLE - ", tour_data.get('title', ''),
                " - SHORT DESCRIPTION - ", tour_data.get('short_description', ''),
                " - LONG DESCRIPTION - ", tour_data.get('long_description', ''),
                " - TAGS - ", ' '.join(tour_data.get('tags', [])),
                " - DIFFICULTY - ", tour_data.get('difficulty', 'difficult'),
                " - AMENITIES -", ' '.join(tour_data.get('amenities', " ")),
            ]
            text_content = ' '.join(filter(None, text_content))
            logging.debug(f"Prepared text content for tour {tour_id}")

            # Get text embedding
            logging.debug("Computing text embedding...")
            text_embedding = self.retriever.get_text_embeddings(text_content, output_dim=self.text_dim).numpy()
            text_embedding = text_embedding.squeeze()
            logging.debug(f"Text embedding shape: {text_embedding.shape}")

            # Process images
            image_embeddings = []
            images = tour_data.get('images', [])
            logging.debug(f"Processing {len(images)} images for tour {tour_id}")
            
            for idx, image in enumerate(images):
                if image.get('url'):
                    try:
                        logging.debug(f"Processing image {idx + 1}/{len(images)}")
                        pil_image = self.load_image_from_url(image['url'])
                        img_emb = self.retriever.get_image_embeddings(pil_image, output_dim=self.image_dim).numpy().squeeze()

                        if image.get('caption'):
                            caption_emb = self.retriever.get_text_embeddings(image['caption'], output_dim=self.text_dim).numpy().squeeze()
                            combined_emb = (img_emb + caption_emb) / 2
                        else:
                            combined_emb = img_emb
                        image_embeddings.append(combined_emb)
                        logging.debug(f"Successfully processed image {idx + 1}")
                    except Exception as e:
                        logging.error(f"Error processing image {idx + 1} for tour {tour_id}: {str(e)}")
                        logging.error(traceback.format_exc())
                        continue

            # Handle case with no valid image embeddings
            if not image_embeddings:
                logging.warning(f"No valid image embeddings for tour {tour_id}")
                image_embedding = np.zeros(self.image_dim)
            else:
                image_embedding = np.mean(image_embeddings, axis=0)
                logging.debug(f"Created mean image embedding with shape: {image_embedding.shape}")

            # Concatenate embeddings
            final_embedding = np.concatenate([text_embedding, image_embedding])
            logging.debug(f"Final embedding shape: {final_embedding.shape}")

            if final_embedding.shape[0] != self.embedding_dim:
                error_msg = f"Dimension mismatch for tour {tour_id}: Expected {self.embedding_dim}, got {final_embedding.shape[0]}"
                logging.error(error_msg)
                raise ValueError(error_msg)

            return final_embedding

        except Exception as e:
            logging.error(f"Error computing embedding for tour {tour_id}: {str(e)}")
            logging.error(traceback.format_exc())
            raise

    def build_index(self, tour_data_list: List[Dict]):
        """Build the AnnoyIndex from tour embeddings."""
        logging.info(f"Starting to build index with {len(tour_data_list)} tours")
        successful_tours = 0
        failed_tours = 0

        try:
            for idx, tour in tqdm(enumerate(tour_data_list), total=len(tour_data_list), desc="Building tour index"):
                tour_id = tour['tour_id']
                try:
                    logging.debug(f"Processing tour {idx + 1}/{len(tour_data_list)}, tour_id: {tour_id}")
                    
                    # Compute and store embedding
                    embedding = self.compute_tour_embedding(tour)
                    self.tour_embeddings[tour_id] = embedding
                    # print("tour:",type(int(tour_id)))
                    # Add to Annoy index
                    self.annoy_index.add_item(int(tour_id), embedding)
                    successful_tours += 1
                    
                    if successful_tours % 1 == 0:
                        logging.info(f"Successfully processed {successful_tours} tours")
                
                except Exception as e:
                    failed_tours += 1
                    logging.error(f"Failed to process tour {tour_id}: {str(e)}")
                    logging.error(traceback.format_exc())
                    continue

            logging.info("Building the Annoy index...")
            self.annoy_index.build(10)
            logging.info("Successfully built Annoy index")
            logging.info(f"Final statistics: {successful_tours} tours processed successfully, {failed_tours} tours failed")

        except Exception as e:
            logging.error(f"Fatal error during index building: {str(e)}")
            logging.error(traceback.format_exc())
            raise
        
    def is_id_in_annoy_index(self, tour_id):
        try:
            # Attempt to get the vector for the given ID
            vector = self.annoy_index.get_item_vector(int(tour_id))
            return True
        except IndexError:
            return False
        
    def compute_user_embedding(self, 
                             user_id: str,
                             stored_embeddings: Optional[Dict[str, np.ndarray]] = None,
                             tour_ratings: Optional[List[Dict[str, float]]] = None) -> np.ndarray:
        """Compute user embedding."""
        text_embeddings = []
        visual_embeddings = []
        weights_visual = []
        weights_text=[]
        # print(stored_embeddings)
        
        # Process stored embeddings
        if stored_embeddings is not None:
                # text_embeddings.append(liked_embedding[:self.text_dim])
                visual_embeddings.append(stored_embeddings['liked'])
                weights_visual.append(self.weights['liked_weight'])
            
                # text_embeddings.append(disliked_embedding[:self.base_dim])
                visual_embeddings.append(stored_embeddings['disliked'])
                weights_visual.append(self.weights['disliked_weight'])
        # print("weights_visual",weights_visual)
        # Process tour ratings
        if tour_ratings:
            # print("tour_ratings",tour_ratings)
            ratings = [r['rating'] for r in tour_ratings]
            avg_rating = np.mean(ratings) if ratings else 0
            # print("avg_rating",avg_rating)
            for rating_info in tour_ratings:
                tour_id = rating_info['tour_id']
                if self.is_id_in_annoy_index:
                    emb = self.annoy_index.get_item_vector(tour_id)
                    text_embeddings.append(emb[:self.text_dim])
                    visual_embeddings.append(emb[self.image_dim:])
                    # print("visual_embeddings",len(visual_embeddings))
                    rating_weight = (rating_info['rating'] - (avg_rating-0.8)) / 5.0 * self.weights['rating_scale']
                    weights_visual.append(rating_weight)
                    # print("text_embeddings",len(text_embeddings) )
                    weights_text.append(rating_weight)
        # Compute final embedding
        if not text_embeddings and not visual_embeddings:
            return self.weights['zero_embedding']
            
        # Convert lists to arrays for computation
        text_embeddings = np.array(text_embeddings)
        visual_embeddings = np.array(visual_embeddings)
        weights_visual = np.array(weights_visual)
        weights_text = np.array(weights_text)
        # print("text_embeddings",text_embeddings.shape,"visual_embeddings",visual_embeddings.shape,"weights_visual",weights_visual.shape,"weights_text",weights_text.shape)
        # Compute weighted averages
        if(text_embeddings.shape[0]>0):
            # print(text_embeddings.shape[0])
            text_avg=np.matmul(weights_text.reshape(1,-1),text_embeddings).reshape(-1)
            text_avg_norm = np.linalg.norm(text_avg)
            if text_avg_norm != 0:
                text_avg /= text_avg_norm
        else :
            text_avg=np.zeros(self.text_dim)
        if(visual_embeddings.shape[0]>0):
            # print(visual_embeddings.shape[0])
            visual_avg=np.matmul(weights_visual.reshape(1,-1),visual_embeddings).reshape(-1)
            visual_avg_norm = np.linalg.norm(visual_avg)
            if visual_avg_norm != 0:
                visual_avg /= visual_avg_norm
        else :
            visual_avg=np.zeros(self.image_dim)
        # Concatenate and store
        # print("visual_avg",visual_avg.shape,"text_avg",text_avg.shape)
        final_embedding = np.concatenate([text_avg, visual_avg])
        # print("final_embedding",final_embedding.shape)
        self.user_embeddings[user_id] = final_embedding
        return final_embedding.reshape(-1)

    def get_filtered_results(self, final_embedding: np.ndarray, exclude_indices: set, 
                           threshold: float, search_k: int) -> List[Dict]:
        """Helper method to get filtered results with a specific threshold."""
        indices, distances = self.annoy_index.get_nns_by_vector(
            final_embedding,
            search_k,
            include_distances=True
        )
        
        filtered_results = []
        for tour_id, distance in zip(indices, distances):
            if tour_id in exclude_indices:
                continue
            
            similarity_score = 1 - (distance / 2)
            if similarity_score >= threshold:
                filtered_results.append({
                    'tour_id': tour_id,
                    'similarity_score': float(similarity_score)
                })

        return filtered_results

    def get_recommendations(self,
                            user_id: str,
                            user_query: Optional[str] = None,
                            stored_embeddings: Optional[Dict[str, np.ndarray]] = None,
                            tour_ratings: Optional[List[Dict[str, float]]] = None,
                            disliked_tour_indices: Optional[List[int]] = None) -> Dict:
        """
        Get 150 personalized recommendations with adaptive thresholding.
        """
        # Base embedding calculation remains the same
        base_embedding = self.compute_user_embedding(
            user_id=user_id,
            stored_embeddings=stored_embeddings,
            tour_ratings=tour_ratings
        )
        # print("base_embedding",base_embedding)
        # Process user query if provided
        final_embedding = base_embedding.copy()
        if user_query:
            query_embedding = self.retriever.get_text_embeddings(user_query, output_dim=self.text_dim).numpy()
            text_part = final_embedding[:self.text_dim]
            query_weight = self.QUERY_WEIGHT
            combined_text = (text_part + query_weight * query_embedding) / (1 + query_weight)
            final_embedding[:self.text_dim] = combined_text

            text_norm = np.linalg.norm(final_embedding[:self.embedding_dim//2])
            if text_norm > 0:
                final_embedding[:self.embedding_dim//2] /= text_norm
        # print("error")

        # Exclusion set
        exclude_indices = set(disliked_tour_indices or [])
        if tour_ratings:
            rated_tour_ids = {rating['tour_id'] for rating in tour_ratings}
            exclude_indices.update(rated_tour_ids)
        # Search parameters for 150 results
        total_needed = 150
        buffer_multiplier = 1
        search_k = (total_needed + len(exclude_indices)) * buffer_multiplier
        print("final_embedding",final_embedding)
        # Adaptive thresholding to get sufficient results
        filtered_results = None
        used_threshold = None
        for threshold in self.threshold_steps:
            filtered_results = self.get_filtered_results(
                final_embedding,
                exclude_indices,
                threshold,
                search_k
            )
            if len(filtered_results) >= total_needed:
                used_threshold = threshold
                break

        # Fallback to lowest threshold if needed
        if not filtered_results or len(filtered_results) == 0:
            used_threshold = self.threshold_steps[-1]
            filtered_results = self.get_filtered_results(
                final_embedding,
                exclude_indices,
                used_threshold,
                search_k
            )

        # Trim to top 150 results if necessary
        original_count = len(filtered_results)
        if original_count > total_needed:
            filtered_results = filtered_results[:total_needed]

        # Prepare metadata
        return {
            'recommendations': filtered_results,
            'metadata': {
                'total_available': len(filtered_results),
                'min_similarity': min([r['similarity_score'] for r in filtered_results]) if filtered_results else None,
                'max_similarity': max([r['similarity_score'] for r in filtered_results]) if filtered_results else None,
                'used_threshold': used_threshold,
                'reached_min_results': original_count >= total_needed
            }
        }
        
        """
        use of returning response
            Understanding 'total_available' and 'has_next'

            'total_available': len(filtered_results)
                What it represents: This field indicates the total number of recommendations available that satisfy the user's preferences and query (after filtering out disliked or already-rated tours). It tells you the size of the pool of potential recommendations before pagination is applied.
                How it's calculated: It's simply the length of the filtered_results list. This list contains all the tour IDs that are considered relevant to the user but haven't been filtered out due to pagination yet.
                Use Cases:
                    Frontend Display: You might display this information to the user in a format like "Showing 10 of 53 results" or "53 tours match your preferences." This gives the user an idea of how many more recommendations are potentially available beyond the current page.
                    Pagination Logic (Client-Side): A frontend application can use this value to determine how many pages of results to display in the pagination controls or if a "Load More" button is applicable.

            'has_next': len(filtered_results) > end_idx
                What it represents: This field is a boolean flag indicating whether there are more recommendations available beyond the current page.
                How it's calculated: It compares the length of filtered_results (total available) with end_idx. end_idx is the index of the last item on the current page. If len(filtered_results) is greater than end_idx, it means there are more items in filtered_results that haven't been shown yet.
                Use Cases:
                    Frontend Pagination: The most common use case is to enable or disable a "Next Page" button or a "Load More" button on the frontend. If has_next is True, the button is enabled; otherwise, it's disabled or hidden, indicating that the user has reached the end of the available recommendations.
                    Infinite Scrolling: In an infinite scrolling implementation, has_next would trigger an AJAX request to fetch the next page of recommendations when the user scrolls near the bottom of the current set of results.

        Example Scenario

        Let's say a user has preferences that match 75 tours. You set page_size to 10.

            Page 1:
                'total_available': 75 (because 75 tours match the criteria)
                'has_next': True (because 75 > 10)
                The frontend displays recommendations 1-10 and shows a "Next Page" button.

            Page 7:
                'total_available': 75
                'has_next': True (because 75 > 70)
                The frontend displays recommendations 61-70 and shows a "Next Page" button.

            Page 8:
                'total_available': 75
                'has_next': False (because 75 is not greater than 75)
                The frontend displays recommendations 71-75 and hides the "Next Page" button because there are no more pages.

        In summary:

        'total_available' and 'has_next' are essential pieces of metadata for implementing pagination in a recommendation system. They provide the necessary information for a client-side application to:

            Inform the user about the total number of relevant recommendations.
            Control the display and behavior of pagination controls or infinite scrolling mechanisms.
            Dynamically fetch more recommendations when needed.
        """