import type { Review } from "./types";

export const REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: "r1",
      buyer: "StartupFashion Inc.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Excellent quality and communication. Highly recommend!",
      scores: { speed: 5, responsiveness: 5, quality: 5, onTime: 5 },
    },
    {
      id: "r2",
      buyer: "TrendyWear Ltd.",
      rating: 4.5,
      date: "1 month ago",
      comment:
        "Great experience overall. Minor delay but they communicated proactively.",
      scores: { speed: 4, responsiveness: 5, quality: 5, onTime: 4 },
    },
  ],
};
