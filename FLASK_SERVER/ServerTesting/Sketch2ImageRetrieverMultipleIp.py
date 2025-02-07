import requests
import base64
import concurrent.futures
import time
import random
from collections import defaultdict
import statistics
import aiohttp
import asyncio
import pandas as pd
from fake_headers import Headers

class ConcurrencyTester:
    def __init__(self, base_url, image_path, num_requests=100, max_workers=10):
        self.base_url = base_url
        self.image_path = image_path
        self.num_requests = num_requests
        self.max_workers = max_workers
        self.results = defaultdict(list)
        
        # Load and encode image once
        with open(image_path, 'rb') as f:
            self.sketch_base64 = base64.b64encode(f.read()).decode()
            
        # Test captions for variety
        self.test_captions = [
            "water body",
            "mountain landscape",
            "forest trail",
            "urban scene",
            "beach view"
        ]

    def generate_random_ip(self):
        """Generate a random IP address"""
        return f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"

    def get_random_headers(self):
        """Generate random headers to simulate different clients"""
        header_generator = Headers(
            browser="chrome",
            os="win",
            headers=True
        )
        headers = header_generator.generate()
        headers['X-Forwarded-For'] = self.generate_random_ip()
        return headers

    async def make_single_request(self, session, request_id):
        """Make a single async request"""
        start_time = time.time()
        data = {
            'sketch': self.sketch_base64,
            'caption': random.choice(self.test_captions)
        }
        
        try:
            async with session.post(
                self.base_url,
                json=data,
                headers=self.get_random_headers(),
                timeout=30
            ) as response:
                elapsed_time = time.time() - start_time
                status = response.status
                
                if status == 200:
                    result = await response.json()
                    return {
                        'request_id': request_id,
                        'status': status,
                        'time': elapsed_time,
                        'success': True,
                        'error': None,
                        'results_count': len(result.get('results', []))
                    }
                else:
                    return {
                        'request_id': request_id,
                        'status': status,
                        'time': elapsed_time,
                        'success': False,
                        'error': f'HTTP {status}',
                        'results_count': 0
                    }
                    
        except Exception as e:
            elapsed_time = time.time() - start_time
            return {
                'request_id': request_id,
                'status': -1,
                'time': elapsed_time,
                'success': False,
                'error': str(e),
                'results_count': 0
            }

    async def run_concurrent_test(self):
        """Run concurrent requests and collect results"""
        all_results = []
        async with aiohttp.ClientSession() as session:
            tasks = []
            for i in range(self.num_requests):
                task = asyncio.create_task(
                    self.make_single_request(session, i)
                )
                tasks.append(task)
                
                # Control concurrency
                if len(tasks) >= self.max_workers:
                    batch_results = await asyncio.gather(*tasks)
                    all_results.extend(batch_results)
                    tasks = []
                    
            # Handle any remaining tasks
            if tasks:
                batch_results = await asyncio.gather(*tasks)
                all_results.extend(batch_results)
                
        return all_results

    def run_test(self):
        """Main method to run the test"""
        print(f"Starting concurrent test with {self.num_requests} total requests, {self.max_workers} max concurrent requests")
        
        # Run async test
        all_results = asyncio.run(self.run_concurrent_test())
        
        # Analyze results
        analysis = self.analyze_results(all_results)
        
        # Print report
        print("\nTest Results:")
        print(f"Total Requests: {analysis['total_requests']}")
        print(f"Successful Requests: {analysis['successful_requests']}")
        print(f"Failed Requests: {analysis['failed_requests']}")
        print(f"\nResponse Times (seconds):")
        print(f"  Average: {analysis['average_response_time']:.3f}")
        print(f"  Median: {analysis['median_response_time']:.3f}")
        print(f"  Min: {analysis['min_response_time']:.3f}")
        print(f"  Max: {analysis['max_response_time']:.3f}")
        print(f"  Std Dev: {analysis['response_time_std']:.3f}")
        
        print("\nStatus Code Distribution:")
        for code, count in analysis['status_codes'].items():
            print(f"  HTTP {code}: {count}")
            
        if analysis['error_types']:
            print("\nError Types:")
            for error, count in analysis['error_types'].items():
                print(f"  {error}: {count}")
                
        return analysis

    def analyze_results(self, results):
        """Analyze and report test results"""
        df = pd.DataFrame(results)
        
        analysis = {
            'total_requests': len(df),
            'successful_requests': len(df[df['success'] == True]),
            'failed_requests': len(df[df['success'] == False]),
            'average_response_time': df['time'].mean(),
            'median_response_time': df['time'].median(),
            'min_response_time': df['time'].min(),
            'max_response_time': df['time'].max(),
            'response_time_std': df['time'].std(),
            'status_codes': df['status'].value_counts().to_dict(),
            'error_types': df[df['error'].notnull()]['error'].value_counts().to_dict()
        }
        
        return analysis


# Usage example
if __name__ == "__main__":
    tester = ConcurrencyTester(
        base_url='http://localhost:5000/Sketch2ImageRetriever',
        image_path='../../new_idea/tsbir/sketches/image.png',
        num_requests=100,  # Total number of requests to make
        max_workers=10     # Maximum concurrent requests
    )
    
    results = tester.run_test()
    
    
    """
        Starting concurrent test with 100 total requests, 10 max concurrent requests
        Test Results:
        Total Requests: 100
        Successful Requests: 100
        Failed Requests: 0

        Response Times (seconds):
        Average: 0.214
        Median: 0.215
        Min: 0.197
        Max: 0.230
        Std Dev: 0.007

        Status Code Distribution:
        HTTP 200: 100
    """