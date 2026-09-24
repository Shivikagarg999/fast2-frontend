// Three pulsing dots in place of a round spinner. Colour comes from the text colour (bg-current).
const SIZES = { sm: 'w-1.5 h-1.5', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };

export default function LoadingDots({ size = 'md', className = 'text-brand-600' }) {
  const dot = `${SIZES[size] || SIZES.md} rounded-full bg-current animate-bounce`;
  return (
    <span role="status" aria-label="Loading" className={`inline-flex items-center gap-1 ${className}`}>
      <span className={dot} style={{ animationDelay: '-0.3s' }} />
      <span className={dot} style={{ animationDelay: '-0.15s' }} />
      <span className={dot} />
    </span>
  );
}
