interface AffiliateLinkProps {
  providerId: string;
  providerName: string;
  affiliateUrl: string | null;
  website: string;
  source: string;
  variant?: "primary" | "compact";
}

export default function AffiliateLink({
  providerId,
  providerName,
  source,
  variant = "primary",
}: Readonly<AffiliateLinkProps>) {
  const trackingUrl = `/api/affiliate/${encodeURIComponent(providerId)}?source=${encodeURIComponent(source)}`;

  if (variant === "compact") {
    return (
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 transition-colors"
      >
        Visit Site
        <ExternalLinkIcon size={14} />
      </a>
    );
  }

  return (
    <a
      href={trackingUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 transition-colors"
    >
      Visit {providerName}
      <ExternalLinkIcon size={16} />
    </a>
  );
}

function ExternalLinkIcon({ size }: Readonly<{ size: number }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  );
}
