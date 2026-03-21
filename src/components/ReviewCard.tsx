import RatingStars from "@/components/RatingStars";

interface ReviewCardProps {
  review: {
    authorName: string;
    rating: number;
    title: string | null;
    body: string;
    helpful: number;
    createdAt: Date;
  };
}

function formatReviewDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function ReviewCard({ review }: Readonly<ReviewCardProps>) {
  return (
    <article className="border-b border-gray-200 py-6 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm"
              aria-hidden="true"
            >
              {review.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{review.authorName}</p>
              <time
                dateTime={review.createdAt.toISOString()}
                className="text-xs text-gray-500"
              >
                {formatReviewDate(review.createdAt)}
              </time>
            </div>
          </div>
        </div>
        <RatingStars rating={review.rating} showNumeric={false} size="sm" />
      </div>

      {review.title && (
        <h4 className="mt-3 font-semibold text-gray-900">{review.title}</h4>
      )}

      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
        {review.body}
      </p>

      {review.helpful > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
          </svg>
          {review.helpful} {review.helpful === 1 ? "person" : "people"} found this helpful
        </p>
      )}
    </article>
  );
}
