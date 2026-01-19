import React, { useEffect, useState } from "react";
import axios from "axios";
import ReviewsList from "../profiles/treacherInfo/ReviewsList";

/**
 * CourseReviewsSection - Display reviews for a course
 * Only shown when the user is NOT enrolled
 * Reuses the existing ReviewsList and ReviewCard components
 */
export default function CourseReviewsSection({ courseId, isEnrolled }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch reviews if user is not enrolled
    if (isEnrolled || !courseId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/reviews/course/${courseId}`
        );
        
        if (response.data) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error("Error fetching course reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [courseId, isEnrolled]);

  // Don't render anything if user is enrolled
  if (isEnrolled) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        What Students Say
      </h2>
      
      <ReviewsList reviews={reviews} loading={loading} />
    </div>
  );
}
