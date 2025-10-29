import React from "react";
import ReviewCard from "./ReviewCard";

export default function ReviewsList({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
