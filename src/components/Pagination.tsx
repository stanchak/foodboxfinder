import Link from "next/link";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: Readonly<{
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
}>) {
  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Build page range: show up to 5 page numbers around current
  const pageNumbers: number[] = [];
  const rangeStart = Math.max(1, currentPage - 2);
  const rangeEnd = Math.min(totalPages, currentPage + 2);
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Go to previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed"
          aria-disabled="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Page numbers - hidden on very small screens */}
      <div className="hidden sm:flex items-center gap-1">
        {rangeStart > 1 && (
          <>
            <Link
              href={buildHref(1)}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors min-w-[40px]"
              aria-label="Go to page 1"
            >
              1
            </Link>
            {rangeStart > 2 && (
              <span className="px-1 text-gray-400" aria-hidden="true">
                ...
              </span>
            )}
          </>
        )}

        {pageNumbers.map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-[40px] ${
              page === currentPage
                ? "bg-primary-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ))}

        {rangeEnd < totalPages && (
          <>
            {rangeEnd < totalPages - 1 && (
              <span className="px-1 text-gray-400" aria-hidden="true">
                ...
              </span>
            )}
            <Link
              href={buildHref(totalPages)}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors min-w-[40px]"
              aria-label={`Go to page ${totalPages}`}
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden text-sm text-gray-600 px-3">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      ) : (
        <span
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 cursor-not-allowed"
          aria-disabled="true"
        >
          <span className="hidden sm:inline">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      )}
    </nav>
  );
}
