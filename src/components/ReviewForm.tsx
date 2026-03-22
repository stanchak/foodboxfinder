"use client";

import { useActionState, useState, useCallback, useRef, useEffect } from "react";
import { submitReview } from "@/app/actions/reviews";
import type { ReviewFormState } from "@/app/actions/reviews";
import StarRatingInput from "@/components/StarRatingInput";
import Button from "@/components/Button";

const initialState: ReviewFormState = {
  success: false,
  message: "",
  errors: {},
};

export default function ReviewForm({
  providerId,
}: Readonly<{
  providerId: string;
}>) {
  const [state, formAction, isPending] = useActionState(
    submitReview,
    initialState,
  );
  const [rating, setRating] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  // Focus the success message for screen readers when submission succeeds
  useEffect(() => {
    if (state.success && successRef.current) {
      successRef.current.focus();
    }
  }, [state.success]);

  // Show success state
  if (state.success) {
    return (
      <div
        ref={successRef}
        className="rounded-xl border border-green-200 bg-green-50 p-6 text-center"
        role="status"
        tabIndex={-1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto text-green-600"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-green-800">
          Review Submitted
        </h3>
        <p className="mt-1 text-sm text-green-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {/* Hidden provider ID */}
      <input type="hidden" name="providerId" value={providerId} />

      {/* Honeypot field — visually hidden, screen-reader hidden */}
      <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
        <label htmlFor="website_url">Do not fill this field</label>
        <input
          type="text"
          id="website_url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* General error */}
      {state.errors.general && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {state.errors.general}
        </div>
      )}

      {/* Star Rating */}
      <StarRatingInput
        name="rating"
        value={rating}
        onChange={handleRatingChange}
        error={state.errors.rating}
      />

      {/* Title (optional) */}
      <div>
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-neutral-700"
        >
          Title{" "}
          <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <input
          id="review-title"
          name="title"
          type="text"
          maxLength={200}
          placeholder="Summarize your experience"
          className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
          disabled={isPending}
        />
      </div>

      {/* Body (required) */}
      <div>
        <label
          htmlFor="review-body"
          className="block text-sm font-medium text-neutral-700"
        >
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          required
          minLength={10}
          maxLength={5000}
          placeholder="Share your experience with this food box service..."
          className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500 resize-y"
          disabled={isPending}
        />
        {state.errors.body && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {state.errors.body}
          </p>
        )}
      </div>

      {/* Name and Email row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name (required) */}
        <div>
          <label
            htmlFor="review-author-name"
            className="block text-sm font-medium text-neutral-700"
          >
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            id="review-author-name"
            name="authorName"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Jane D."
            className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            disabled={isPending}
          />
          {state.errors.authorName && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {state.errors.authorName}
            </p>
          )}
        </div>

        {/* Email (optional) */}
        <div>
          <label
            htmlFor="review-author-email"
            className="block text-sm font-medium text-neutral-700"
          >
            Email{" "}
            <span className="font-normal text-neutral-400">(optional)</span>
          </label>
          <input
            id="review-author-email"
            name="authorEmail"
            type="email"
            maxLength={254}
            placeholder="jane@example.com"
            className="mt-1 block w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-50 disabled:text-neutral-500"
            disabled={isPending}
          />
          {state.errors.authorEmail && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {state.errors.authorEmail}
            </p>
          )}
          <p className="mt-1 text-xs text-neutral-400">
            Not displayed publicly. Used only if we need to contact you.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit Review"}
        </Button>
        {isPending && (
          <span className="text-sm text-neutral-500" aria-live="polite">
            Submitting your review...
          </span>
        )}
      </div>
    </form>
  );
}
