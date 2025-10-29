import React from "react";

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex gap-4">
        <img
          src={review.avatar || "/placeholder.svg"}
          alt={review.student}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between mb-2">
            <div>
              <h4 className="font-semibold">{review.student}</h4>
              <p className="text-sm text-gray-500">{review.date}</p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-yellow-400 ${i < review.rating ? "★" : "☆"}`}></span>
              ))}
            </div>
          </div>
          <p className="mb-2">{review.comment}</p>
          <span className="text-xs text-gray-500">{review.course}</span>
        </div>
      </div>
    </div>
  );
}
