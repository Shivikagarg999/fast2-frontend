'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Footer from "./components/footer/page";
import CategorySection from "./category/page";
import SubcategorySection from "./subcategory/page";
import ProductListingSection from "./pages/productListing/page";
import Banner from "./components/banner/page";
import PopupManager from "./components/popup/PopupManager";
import ProductGridSkeleton from "./components/skeletons/ProductGridSkeleton";

const LoadingProducts = () => (
  <div className="max-w-7xl mx-auto px-4 py-6">
    <ProductGridSkeleton count={12} />
  </div>
);

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
          <SubcategorySection />
          <div className="max-w-7xl mx-auto px-4 pt-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Available near you</h2>
            <p className="text-sm text-gray-500 mb-4">Products from shops close to your location</p>
          </div>
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
      <PopupManager />
      <HomeContent />
    </Suspense>
  );
}