import { Suspense } from 'react';
import Footer from "./components/footer/page";
import CategorySection from "../app/category/page";
import ProductListingSection from "./pages/productListing/page";
import Banner from "./components//banner/page";

export const dynamic = 'force-dynamic';

const LoadingProducts = () => {
  return (
    <div className="text-center p-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading products...</p>
    </div>
  );
};

export default function Home({ searchParams }) {
  const hasSearchQuery = !!searchParams?.search;

  return (
    <>
      {!hasSearchQuery && (
        <>
          <Banner />
          <CategorySection />
        </>
      )}
      
      <Suspense fallback={<LoadingProducts />}>
        <ProductListingSection />
      </Suspense>
      
      <Footer />
    </>
  );
}