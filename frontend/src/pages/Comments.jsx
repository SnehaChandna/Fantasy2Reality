import { useLocation } from "react-router-dom";

export const Comments = () => {
  // Get the state from the Link component in LeftInfo
  const location = useLocation();
  const { reviews } = location.state || {}; 

  return (
    <div className="p-4">
      <h2 className="text-xl font-medium text-gray-800">All Comments</h2>
      {reviews && reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} className="mb-4 p-2 border rounded-md bg-white shadow-sm">
            <p className="font-semibold text-gray-800">{review.name}</p>
            <p className="text-yellow-500">
              {"★".repeat(review.rating)}{" "}
              {"☆".repeat(5 - review.rating)}
            </p>
            <p className="text-gray-600">{review.text}</p>
            {review.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {review.images.map((image, idx) => (
                  <img key={idx} src={image} alt="Review Attachment" className="w-full h-48 max-w-xs rounded-md mt-2" />
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600">No reviews available.</p>
      )}
    </div>
  );
};
