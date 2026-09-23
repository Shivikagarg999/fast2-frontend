import Image from "next/image";
import Link from "next/link";
import notFoundImg from "@/assets/images/404.png";

// Shared "this page doesn't exist" view - used by the site-wide not-found.jsx and by
// detail pages (product / shop / category / subcategory) when the item is missing.
const PageNotFound = ({
  title = "Oops! We couldn't find that page",
  message = "The page you're looking for may have been moved or no longer exists.",
}) => (
  <div className="bg-white flex flex-col items-center justify-center text-center px-4 py-10 min-h-[70vh]">
    <Image
      src={notFoundImg}
      alt="404 - page not found"
      priority
      className="w-full max-w-xl h-auto"
    />
    <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h1>
    <p className="mt-2 text-gray-500 max-w-md">{message}</p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/"
        className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        Go to Home
      </Link>
      <Link
        href="/shops"
        className="border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        Browse Shops
      </Link>
    </div>
  </div>
);

export default PageNotFound;
