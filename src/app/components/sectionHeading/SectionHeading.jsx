import Link from 'next/link';

// Single heading style for every home-page section so they always look the same.
export const SECTION_HEADING_CLASS = 'text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight';

export default function SectionHeading({ title, subtitle, href, linkLabel = 'See all', className = 'mb-4' }) {
  return (
    <div className={`flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className={SECTION_HEADING_CLASS}>{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors flex-shrink-0"
        >
          {linkLabel} <span className="text-base">→</span>
        </Link>
      )}
    </div>
  );
}
