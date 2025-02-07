from flask import Flask, request, jsonify
import torch
import base64
from PIL import Image
import io
from pathlib import Path
import sys
from Sketch2ImageRetriever import get_feature, process_sketch, initialize_model
from quizAlgo.embedding.embedding_utils import TourEmbeddingHandler_Quiz
from quizAlgo.dpp_utils import DPPRecommender  
from quizAlgo.embedding.JinaRetriever import JinaRetriever
import json
from RecommendationSystem import ContentBasedTourRecommender
import os
from tqdm import tqdm
from flask_cors import CORS

#global variables
EMBEDDING_DIM_one_part=1024

# Define base paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'Data'

# Configure Flask with debug settings
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 
app.config['DEBUG'] = True # Enable debug mode
app.config['TEMPLATES_AUTO_RELOAD'] = True  # Enable template auto-reload
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Prevent caching of static files

embedding_handler = None
dpp_recommender = None
recommender=None

def initialize_recommendation_system():
    global recommender    
    try:
        # Initialize retriever (reuse the one from quiz system)
        retriever = JinaRetriever()        
        # Initialize recommender
        recommender = ContentBasedTourRecommender(retriever,embedding_dim=EMBEDDING_DIM_one_part)
        
        #opening the Tour Data
        tour_data_path = DATA_DIR / 'final_data_multi.json'
        if not tour_data_path.exists():
            raise FileNotFoundError(f"Tour data file not found at {tour_data_path}")
            
        with open(tour_data_path, 'r', encoding='utf-8') as f:
            tour_data = json.load(f)
        
        if not tour_data:
            raise ValueError("Tour data is empty")
        
        # Check for recommendation index
        recommendation_index_path = DATA_DIR / 'recommendation_index.ann'
        
        if recommendation_index_path.exists():
            print("Loading existing recommendation index...")
            recommender.annoy_index.load(str(recommendation_index_path))
            
        else:
            print("Building new recommendation index...")
            recommender.build_index(tour_data)
            # Save the index and tour_id_map for future use
            recommender.annoy_index.save(str(recommendation_index_path))
        
        print("Recommendation system initialized successfully")
        return True
        
    except Exception as e:
        print(f"Failed to initialize recommendation system: {str(e)}")
        return False
    
def initialize_quiz_server():
    global embedding_handler, dpp_recommender
    try:
        # Initialize retriever
        retriever = JinaRetriever()
        embedding_handler = TourEmbeddingHandler_Quiz(retriever,singlePartDim=EMBEDDING_DIM_one_part)
        
        # Load tour data with proper path handling
        tour_data_path = DATA_DIR / 'final_data_multi.json'
        if not tour_data_path.exists():
            raise FileNotFoundError(f"Tour data file not found at {tour_data_path}")
            
        with open(tour_data_path, 'r', encoding='utf-8') as f:
            tour_data = json.load(f)
        
        if not tour_data:
            raise ValueError("Tour data is empty")
            
        # Load or compute embeddings
        embedding_file = DATA_DIR / 'tour_embeddings.h5'
        
        if embedding_file.exists():
            embeddings = embedding_handler.load_embeddings(str(embedding_file))
        else:
            print(f"Computing new embeddings as {embedding_file} does not exist")
            embeddings = {}
            for tour in tqdm(tour_data, desc="Computing embeddings"):
                tour_id = tour.get('tour_id')
                cover_image = tour.get('cover_image', {})
                cover_image_url = cover_image.get('url', '')
                if "staticmap" in cover_image_url:
                    print(f"Skipping tour {tour_id}: 'staticmap' found in cover_image URL")
                    continue  # Skip this tour if the URL doesn't contain "staticmap"
                """this will only save the embeddings for the points that have cover image not static map  so not to give these images in 
                quizes 
                as those embeddings are only stored in the embeddings.h5 and htey will be only selected by DPP
                this will not harm the reccommnedations as still we have a large array to choose from"""
                if not tour_id:
                    print(f"Warning: Tour missing tour_id: {tour}")
                    continue
                embeddings[tour_id.real] = embedding_handler.process_tour_data(tour)
            embedding_handler.save_embeddings(embeddings, str(embedding_file))
        
        # Create tour metadata dictionary
        tour_metadata = {tour['tour_id']: tour for tour in tour_data}
        
        if not embeddings or not tour_metadata:
            raise ValueError("No valid embeddings or tour metadata generated")
        # Initialize DPP recommender
        
        dpp_recommender = DPPRecommender(embeddings, tour_metadata)
        
        print("Quiz server initialized successfully")
        return True
        
    except Exception as e:
        print(f"Failed to initialize quiz server: {str(e)}")
        return False

@app.route('/quiz', methods=['POST'])
def quiz():
    try:
        if dpp_recommender is None:
            return jsonify({
                'status': 'error',
                'message': 'Quiz server not properly initialized'
            }), 500
           
        data = request.json
        if not data:
            app.logger.debug("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
           
        # Get the raw lists and filter out empty strings
        positive_ids = data.get('liked_tours', [])
        negative_ids = data.get('disliked_tours', [])
        include_embeddings = data.get('include_embeddings', True)  # New parameter
       
        # Validate tour IDs exist in our metadata
        invalid_positive = [id for id in positive_ids if id not in dpp_recommender.tour_metadata]
        invalid_negative = [id for id in negative_ids if id not in dpp_recommender.tour_metadata]
        # print(dpp_recommender.tour_ids)
        # print(invalid_positive,invalid_negative)
        if invalid_positive or invalid_negative:
            app.logger.debug(f"Invalid IDs found: {invalid_positive + invalid_negative}")
            return jsonify({
                'status': 'error',
                'message': f'Invalid tour IDs provided: {invalid_positive + invalid_negative}'
            }), 400
        result = dpp_recommender.recommend(
            positive_ids=positive_ids,
            negative_ids=negative_ids,
            k=5,
            include_embeddings=include_embeddings
        )
       
        return jsonify({
            'status': 'success',
            **result  # This will include both recommendations and embeddings
        })
       
    except Exception as e:
        app.logger.error(f"Error in quiz endpoint: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    try:
        if 'recommender' not in globals() or recommender is None:
            return jsonify({
                'status': 'error',
                'message': 'Recommendation system not properly initialized'
            }), 500

        data = request.json
        if not data:
            app.logger.debug("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400

        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        user_query = data.get('user_query', "")
        stored_embeddings = data.get('stored_embeddings')
        tour_ratings = data.get('tour_ratings', [])
        disliked_tour_indices = data.get('disliked_tour_indices', [])
        print(tour_ratings)
        recommendations = recommender.get_recommendations(
            user_id=user_id,
            user_query=user_query,
            stored_embeddings=stored_embeddings,
            tour_ratings=tour_ratings,
            disliked_tour_indices=disliked_tour_indices
        )

        return jsonify({
            'status': 'success',
            'data': recommendations
        })

    except Exception as e:
        app.logger.error(f"Error in recommendations endpoint: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
        
@app.route('/', methods=['GET'])
def check_connection():
    return jsonify({
        'status': 'success',
        'message': 'You are connected to the server'
    })        

@app.route('/Sketch2ImageRetriever', methods=['POST'])
def sketch2image_retriever():
    """
    Route handler for sketch-to-image retrieval.
    Handles cases where either sketch or caption might be empty.
    """
    try:
        # Check model initialization
        if 'model' not in globals() or 'faiss_index' not in globals():
            app.logger.error("Model or index not initialized")
            return jsonify({
                'status': 'error',
                'message': 'Sketch2Image model not properly initialized'
            }), 600
        
        # Validate request data
        data = request.json
        if not data:
            app.logger.debug("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
        
        sketch_base64 = data.get('sketch')
        caption = data.get('caption', '')
        
        app.logger.debug(f"Received request - Sketch empty: {not sketch_base64}, Caption: {caption}")
        
        # Initialize variables
        processed_sketch = None
        
        # Process sketch if provided
        if sketch_base64:
            try:
                processed_sketch = process_sketch(sketch_base64)
            except Exception as e:
                app.logger.error(f"Sketch processing error: {str(e)}")
                return jsonify({'error': f'Failed to process sketch: {str(e)}'}), 400
        
        # Validate at least one input is provided
        if not processed_sketch and not caption:
            app.logger.debug("Both sketch and caption are empty")
            return jsonify({
                'error': 'At least one of sketch or caption must be provided'
            }), 400
        
        # Get feature embedding
        try:
            query_feature = get_feature(model, processed_sketch, caption)
            
            # Convert to numpy and search
            query_np = query_feature.cpu().numpy()
            results = faiss_index.search(query_np, k=150)
            # print(results)
            # Format results
            formatted_results = []
            for result in results:
                try:
                    formatted_results.append({
                        'url': result['metadata'].get('url', ''),
                        'tour_id': result['metadata'].get('tour_id', ''),
                        'caption': result['metadata'].get('caption', ''),
                        'date_created': result['metadata'].get('date_created', ''),
                        'similarity': float(result.get('similarity', 0))  # Ensure JSON serializable
                    })
                except Exception as e:
                    app.logger.error(f"Result formatting error: {str(e)}")
                    continue
            
            app.logger.debug(f"Number of results found: {len(formatted_results)}")
            
            return jsonify({
                'status': 'success',
                'results': formatted_results
            })
            
        except Exception as e:
            app.logger.error(f"Feature extraction or search error: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Error processing query: {str(e)}'
            }), 500
        
    except Exception as e:
        app.logger.error(f"Error in sketch2image endpoint: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
# Global initialization
try:
    print("Initializing Sketch2Image model...")
    model, faiss_index, transformer = initialize_model()

    print("Initializing quiz server...")
    if not initialize_quiz_server():
        raise RuntimeError("Failed to initialize quiz server")
        
    print("Initializing recommendation system...")
    if not initialize_recommendation_system():
        raise RuntimeError("Failed to initialize recommendation system")
except Exception as e:
    print(f"Initialization error: {str(e)}")
    sys.exit(1)

# Start the app
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        # debug=True,
        # use_reloader=True,
        # threaded=True
    )