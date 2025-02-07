import React from 'react';
import { useEffect } from 'react';
import { AppBar } from "../components/AppBar";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/work.jpg";
import trail from "../assets/trail.png"
import weather from "../assets/weather.png"
import quiz from "../assets/quiz.png"
import paint from "../assets/paint.png"

export const Dashboard = () => {

  const navigate = useNavigate();
  useEffect(() => {
    const local_store_jwt = localStorage.getItem('token');
    const queryParams = new URLSearchParams(window.location.search);
    const jwtToken = queryParams.get('jwt');
  
    if (jwtToken || local_store_jwt) {
      if (jwtToken) {      
        localStorage.setItem('token', jwtToken);
        // Force state update across components
        window.dispatchEvent(new Event('storage'));
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppBar />
      <div className="flex-1 overflow-y-auto">
        {/* Hero section exactly fills remaining viewport height */}
        <div className="relative h-[calc(100vh-64px)]">
          <img
            src={backgroundImage}
            alt="Background"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-5 sm:bottom-10 left-0 right-0 z-10">
            <div className="mx-auto max-w-7xl px-4">
              <div className="bg-white/65 backdrop-blur-sm rounded-md shadow-lg p-8">
                <div className="text-gray-900">
                  <h1 className="text-3xl font-bold mb-6">
                    Experience the Beauty of Nature
                  </h1>
                  <p className="text-lg leading-relaxed font-medium">
                    Customize your perfect outdoor adventure! <strong>Fantasy2Reality</strong> is an 
                    innovative app that combines user preferences and personalized data to recommend 
                    the ideal hiking trail for you. Whether you're an adventure enthusiast with a 
                    passion for mountains and lakes, or you're looking to experience the nature 
                    you've always fantasized about, <strong>Fantasy2Reality</strong> will help you 
                    move from fantasy to reality with immersive outdoor journeys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="bg-[#f3f1f1] py-12 px-4 lg:px-20">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Discover the Features of <span className="text-blue-600">Fantasy2Reality</span></h1>
            <p className="text-lg text-gray-600 mb-10">"Fantasy2Reality" transforms your outdoor fantasies into memorable experiences with cutting-edge features tailored to your preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 - Personalized Trail Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-4 mx-auto">
                <img src={trail} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Personalized Trail Recommendations</h3>
              <p className="text-gray-600 text-center">Get tailor-made hiking trail suggestions based on your preferences, skill level, and interests.</p>
            </div>

            {/* Feature 2 - Real-Time Weather Insights */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 bg-green-100 rounded-full mb-4 mx-auto">
                <img src={weather} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Real-Time Weather Insights</h3>
              <p className="text-gray-600 text-center">Stay prepared with up-to-date weather forecasts for your chosen trails.</p>
            </div>

            {/* Feature 3 - Interactive Quizzes */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 bg-yellow-100 rounded-full mb-4 mx-auto">
                <img src={quiz} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Interactive Quizzes</h3>
              <p className="text-gray-600 text-center">Take fun, interactive quizzes to help us tailor trail recommendations based on your unique preferences.</p>
            </div>

            {/* Feature 4 - Canvas for Creativity */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center h-16 w-16 bg-purple-100 rounded-full mb-4 mx-auto">
                <img src={paint} /> 
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">Canvas for Creativity</h3>
              <p className="text-gray-600 text-center">Draw and sketch your dream trek or customize your route with our interactive canvas feature.</p>
            </div>
          </div>
        </div>

        <footer className="bg-gradient-to-r bg-bl from-blue-600 to-blue-700 text-white py-16 mt-12">
          <div className="max-w-7xl mx-auto text-center px-6">
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">Your Adventure Awaits!</h2>
            <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
              Ready to explore the great outdoors? Whether you're looking for your next hiking adventure or simply want to escape into nature, <strong>Fantasy2Reality</strong> provides everything you need to make it happen. Let's turn your fantasies into reality.
            </p>
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-yellow-500 text-xl text-gray-800 px-8 py-4 rounded-full font-semibold shadow-lg hover:bg-yellow-400 transform hover:scale-105 transition-all"
            >
              Start Your Journey
            </button>
          </div>

          <div className="bg-blue-900 text-center py-6 mt-8">
            <p className="text-sm text-gray-300">&copy; 2025 Fantasy2Reality. All Rights Reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
};
