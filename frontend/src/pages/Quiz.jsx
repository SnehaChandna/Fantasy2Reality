import React, { useState, useEffect,useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { AppBar } from "../components/AppBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import quizback from "../assets/quizback.jpg";
import { BACKEND_URL } from "../../config";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const hasFetched = useRef(false); // Keep this ref

  useEffect(() => {
    const fetchQuizData = async () => {
      if (hasFetched.current)  return; // Prevent duplicate calls
      try {
        setLoading(true);
        hasFetched.current = true; // Mark as fetched
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${BACKEND_URL}/Quiz`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        console.log("1")
        const a = data.recommendations;
        const formattedQuestions = a.map((item) => ({
          tour_id:item.tour_id,
          image: item.cover_image.url,
          name: item.title,
          question: "Do you like this place?",
          embedding: data.embeddings[String(item.tour_id)] // Store embedding from response
        }));
        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Error fetching quiz data:", err);
        setError("Failed to load quiz data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, []);


  useEffect(() => {
    if (isCompleted && !submitting) {
      handleSubmitFeedback();
    }
  }, [isCompleted]);


  const handleSubmitFeedback = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      
      const formattedData = {
        answer: {},
        embeddings: {}
      };
      // console.log(questions)

      choices.forEach((choice, index) => {
        const questionNumber = index + 1;
        formattedData.answer[questions[index].tour_id] = choice === "Like" ? 1 : 0;
        formattedData.embeddings[questions[index].tour_id] = questions[index].embedding;
      });

      // Print both answers and embeddings
      console.log("Formatted submission data:", formattedData);

      await axios.post(
        `${BACKEND_URL}/feedback`,
        formattedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwipe = (direction) => {
    if (!isCompleted && questions.length > 0) {
      setChoices((prev) => [...prev, direction === "left" ? "Dislike" : "Like"]);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (loading) {
    return (
      <div>
        <AppBar />
        <div className="relative w-screen h-screen object-cover">
          <div className="relative top-14 md:top-11 z-10 flex flex-col items-center min-h-screen py-4 px-4 sm:px-8">
            <div className="relative object-cover w-full max-w-md md:max-w-lg lg:max-w-xl bg-[#3881ca] p-6 sm:p-8 rounded-lg shadow-lg bg-opacity-80">
              <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-40 rounded-lg object-cover"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded-t-lg overflow-hidden">
                <div className="h-full bg-blue-600 animate-pulse"></div>
              </div>

              <div className="relative z-10 p-3 sm:p-5">
                <div className="text-[#ffffff] mb-2 font-medium text-md md:text-xl flex items-center justify-center animate-pulse">
                  Swipe right for like & left for dislike
                </div>
                <div className="text-center">
                  <div className="w-full h-48 sm:h-64 md:h-72 bg-gray-400 rounded-md mb-4 animate-pulse"></div>
                  <div className="h-8 bg-gray-400 rounded-md mb-2 animate-pulse"></div>
                  <div className="h-10 bg-gray-400 rounded-md mb-4 animate-pulse"></div>
                </div>

                <div className="flex justify-between mt-4">
                  <div className="w-1/3 p-2 sm:p-3 bg-gray-400 rounded-md animate-pulse"></div>
                  <div className="w-1/3 p-2 sm:p-3 bg-gray-400 rounded-md animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <AppBar />
      <div className="relative w-screen h-screen object-cover">
        <img
          src={quizback}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
        />

        <div className="relative top-14 md:top-11 z-10 flex flex-col items-center min-h-screen py-4 px-4 sm:px-8">
          <div className="relative object-cover w-full max-w-md md:max-w-lg lg:max-w-xl bg-[#3881ca] p-6 sm:p-8 rounded-lg shadow-lg bg-opacity-80">
            <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-40 rounded-lg object-cover"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded-t-lg overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {questions.length > 0 ? (
              !isCompleted ? (
                <div {...swipeHandlers} className="relative z-10 p-3 sm:p-5">
                  <div className="text-[#ffffff] mb-2 font-medium text-md md:text-xl flex items-center justify-center">
                    Swipe right for like & left for dislike
                  </div>
                  <div className="text-center">
                    <img
                      src={questions[currentIndex].image}
                      alt={questions[currentIndex].name}
                      className="w-full h-48 sm:h-64 md:h-72 object-cover mb-4 rounded-md"
                    />
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-[#eaedfa]">
                      {questions[currentIndex].name}
                    </h2>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-[#eaedfa]">
                      {questions[currentIndex].question}
                    </h3>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleSwipe("left")}
                      className="w-1/3 p-2 sm:p-3 text-sm sm:text-base text-white font-medium rounded-md bg-[#de4e4e] hover:bg-[#de4e4e] transition-colors"
                    >
                      Dislike
                    </button>
                    <button
                      onClick={() => handleSwipe("right")}
                      className="w-1/3 p-2 sm:p-3 text-sm sm:text-base text-white font-medium rounded-md bg-[#4cb95c] hover:bg-[#4cb95c] transition-colors"
                    >
                      Like
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 p-4 sm:p-6 text-center">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-[#eaedfa]">
                    {submitting ? "Submitting your answers..." : "Quiz Completed!"}
                  </h2>
                  <ul className="mt-2 space-y-2 text-[#eaedfa]">
                    {choices.map((choice, index) => (
                      <li
                        key={index}
                        className="text-sm sm:text-lg md:text-xl text-left"
                      >
                        {`Question ${index + 1} (${questions[index].name}): ${choice}`}
                      </li>
                    ))}
                  </ul>
                  {error && (
                    <div className="mt-4 text-red-400 text-sm">
                      {error} <br />
                      <button
                        onClick={handleSubmitFeedback}
                        className="mt-2 text-blue-300 hover:text-blue-400"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center text-white">No Quiz Data Found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;