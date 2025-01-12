import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { AppBar } from "../components/AppBar";
import { useNavigate } from "react-router-dom";
import quizback from "../assets/quizback.jpg";
import A from "../assets/1.jpg";
import B from "../assets/2.jpg";
import C from "../assets/3.jpg";
import D from "../assets/4.jpg";
import E from "../assets/5.jpg";

const Quiz = () => {
  const questions = [
    {
      image: A,
      name: "Mountain Sunrise",
      question: "Do you like this view?",
    },
    {
      image: B,
      name: "Forest Retreat",
      question: "Would you like to visit here?",
    },
    {
      image: C,
      name: "Lakeside Serenity",
      question: "How about this place?",
    },
    {
      image: D,
      name: "Desert Landscape",
      question: "Is this your favorite landscape?",
    },
    {
      image: E,
      name: "Tropical Paradise",
      question: "Would you visit this spot?",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false); 
  const navigate = useNavigate(); 

  const handleSwipe = (direction) => {
    if (!isCompleted) {
      if (direction === "left") {
        setChoices((prevChoices) => [...prevChoices, "Dislike"]);
      } else if (direction === "right") {
        setChoices((prevChoices) => [...prevChoices, "Like"]);
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsCompleted(true); // Mark as completed on the last question
      }
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div>
      <AppBar />
      <div className="relative w-screen h-screen object-cover">
        <img
          src={quizback}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
        />

        <div className="flex justify-center items-center h-screen object-cover">
          <div className="relative object-cover w-full max-w-md bg-[#3881ca] p-6 rounded-lg shadow-lg bg-opacity-80">
            <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-40 rounded-lg object-cover"></div>
            {!isCompleted ? (
              <div {...swipeHandlers} className="relative z-10 p-6">
                <div className="text-center">
                  <img
                    src={questions[currentIndex].image}
                    alt={questions[currentIndex].name}
                    className="w-full h-64 object-cover mb-4 rounded-md"
                  />
                  <h2 className="text-xl font-semibold mb-2 text-[#eaedfa]">
                    {questions[currentIndex].name}
                  </h2>
                  <h3 className="text-2xl font-semibold mb-4 text-[#eaedfa]">
                    {questions[currentIndex].question}
                  </h3>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleSwipe("left")}
                    className="w-1/3 p-3 text-white font-medium rounded-md bg-[#de4e4e] hover:bg-[#de4e4e] transition-colors"
                  >
                    Dislike
                  </button>
                  <button
                    onClick={() => handleSwipe("right")}
                    className="w-1/3 p-3 text-white font-medium rounded-md bg-[#4cb95c] hover:bg-[#4cb95c] transition-colors"
                  >
                    Like
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 p-6 text-center">
                <h2 className="text-2xl font-semibold mb-4 text-[#eaedfa]">Quiz Completed!</h2>
                <ul className="mt-2 space-y-2 text-[#eaedfa]">
                  {choices.map((choice, index) => (
                    <li key={index} className="text-lg">
                      {`Question ${index + 1} (${questions[index].name}): ${choice}`}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/recommendations")}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                  See Recommendations
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
