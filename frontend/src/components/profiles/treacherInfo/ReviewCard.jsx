import React from "react";
import { Star } from "lucide-react";

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-gray-700 font-semibold">
          {review.avatar ? (
            <img
              src={review.avatar}
              alt={review.student}
              className="w-full h-full object-cover"
            />
          ) : (
            (review.student
              ? review.student
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "NA")
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.student}
              </h4>
              <p className="text-sm text-gray-500">{review.date}</p>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <p className="text-gray-800 mb-2">{review.comment}</p>

          {/* Course Badge */}
          <span className="inline-block border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded">
            {review.course}
          </span>
        </div>
      </div>
    </div>
  );
}
