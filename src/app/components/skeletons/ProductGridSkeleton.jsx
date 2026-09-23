// Mirrors the real ProductCard's layout (rounded-2xl card, image block, two text
// lines, price line, button) so the loading state doesn't jump/reflow once real
// products arrive - replaces the old full-page spinner + "Loading products..." text.
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full animate-pulse">
    <div className="h-32 bg-gray-100" />
    <div className="p-3 flex-grow flex flex-col">
      <div className="flex-grow">
        <div className="h-3.5 bg-gray-100 rounded w-5/6 mb-1.5" />
        <div className="h-3.5 bg-gray-100 rounded w-3/5 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
      </div>
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
      <div className="h-9 bg-gray-100 rounded-xl w-full" />
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 12, className = "" }) => (
  <div
    className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${className}`}
  >
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default ProductGridSkeleton;
export { ProductCardSkeleton };
