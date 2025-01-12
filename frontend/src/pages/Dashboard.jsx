import { AppBar } from "../components/AppBar";
import backgroundImage from "../assets/work.jpg";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex flex-col">
      <AppBar />

      <div className="flex-1 relative">
        <img
          src={backgroundImage}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
     
      <div className="relative mt-20 w-full max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search for hiking trails..."
          className="w-full p-2 pl-10 pr-12 text-md bg-[#e9edf1] border border-gray-300 rounded-full shadow-lg"
          aria-label="Search for hiking trails"
        />
        <svg onClick={() => navigate("/recommendations")}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 101 101"
          id="search"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400"
        >
          <path d="M63.3 59.9c3.8-4.6 6.2-10.5 6.2-17 0-14.6-11.9-26.5-26.5-26.5S16.5 28.3 16.5 42.9 28.4 69.4 43 69.4c6.4 0 12.4-2.3 17-6.2l20.6 20.6c.5.5 1.1.7 1.7.7.6 0 1.2-.2 1.7-.7.9-.9.9-2.5 0-3.4L63.3 59.9zm-20.4 4.7c-12 0-21.7-9.7-21.7-21.7s9.7-21.7 21.7-21.7 21.7 9.7 21.7 21.7-9.7 21.7-21.7 21.7z"></path>
        </svg>
      </div>

        <div
          className="absolute bottom-10 right-10 left-10 p-8 bg-white bg-opacity-65 rounded-md shadow-lg"
          style={{
            backdropFilter: "blur(1px)", // Applies blur only behind this box
          }}
        >
          <div className="text-[#060607]">
            <h1 className="text-3xl font-bold mb-6">
              Experience the Beauty of Nature
            </h1>
            <p className="text-lg leading-relaxed font-medium">
              Customize your perfect outdoor adventure!{" "}
              <strong>Fantasy2Reality</strong> is an innovative app that
              combines user preferences and personalized data to recommend the
              ideal hiking trail for you. Whether you're an adventure enthusiast
              with a passion for mountains and lakes, or you're looking to
              experience the nature you've always fantasized about,{" "}
              <strong>Fantasy2Reality</strong> will help you move from fantasy
              to reality with immersive outdoor journeys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
