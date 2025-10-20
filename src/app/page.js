'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from "./components/footer/page";
import CategorySection from "./category/page";
import ProductListingSection from "./pages/productListing/page";
import Banner from "./components/banner/page";

const LoadingProducts = () => {
  return (
    <div className="text-center p-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading products...</p>
    </div>
  );
};

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const hasSearchQuery = !!searchQuery;

  return (
    <>
      {!hasSearchQuery && (
        <>
          <Banner />
          <CategorySection />
        </>
      )}
      
      <ProductListingSection searchQuery={searchQuery} />
      
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingProducts />}>
      <HomeContent />
    </Suspense>
  );
}