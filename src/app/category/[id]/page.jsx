"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/app/components/footer/page';

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id;
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch category details and products
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch category details
        const categoryResponse = await fetch(`https://api.fast2.in/api/category/${categoryId}`);
        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
        }
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);
        
        // Fetch products for this category using your local API
        const productsResponse = await fetch(`https://api.fast2.in/api/product/category/${categoryId}`);
        
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();
        
        // FIX: Check the actual structure of the API response
        // Based on your example JSON, the products are directly in the response
        // not in a products property
        setProducts(productsData.products || productsData || []);
        
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'discount':
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      default:
        return 0;
    }
  });

  const fallbackImage = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Breadcrumb Navigation */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-3 text-sm bg-white px-4 py-2 rounded-full shadow-sm">
              <li>
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/category" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-700 font-semibold truncate max-w-xs">
                {isLoading ? 'Loading...' : category?.name || 'Category'}
              </li>
            </ol>
          </nav>

          {/* Enhanced Category Header */}
          <div className="mb-8">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-300 rounded-lg w-64 mb-6"></div>
                <div className="h-64 bg-gray-300 rounded-xl w-full"></div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {category?.image && (
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h1 className="text-4xl md:text-5xl font-bold mb-2">
                        {category?.name || 'Category Products'}
                      </h1>
                      {category?.description && (
                        <p className="text-lg opacity-90 max-w-2xl">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {!category?.image && (
                  <div className="p-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                      {category?.name || 'Category Products'}
                    </h1>
                    {category?.description && (
                      <p className="text-lg text-gray-600 max-w-2xl">
                        {category.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-red-800">Error loading category</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button 
                    onClick={() => router.push('/category')}
                    className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    Return to all categories
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Controls Bar */}
          {!isLoading && !error && products.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                  <p className="text-gray-700 font-medium">
                    {products.length} product{products.length !== 1 ? 's' : ''} found
                  </p>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white shadow-sm text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Loading State */}
          {isLoading && !error && (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-5 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Products Grid/List */}
          {!isLoading && !error && sortedProducts.length > 0 && (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product) => (
                <div 
                  key={product._id || product.id} 
                  className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'
                  }`}>
                    <Image
                      src={product.images?.[0]?.url || fallbackImage}
                      alt={product.images?.[0]?.altText || product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                    {product.discountPercentage > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        -{product.discountPercentage}%
                      </div>
                    )}
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {product.formattedPrice || `₹${product.price}`}
                      </span>
                      {product.oldPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.formattedOldPrice || `₹${product.oldPrice}`}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          product.quantity > (product.lowStockThreshold || 5) 
                            ? 'bg-green-400' 
                            : product.quantity > 0 
                            ? 'bg-yellow-400' 
                            : 'bg-red-400'
                        }`}></div>
                        <span className={`text-xs font-medium ${
                          product.quantity > (product.lowStockThreshold || 5) 
                            ? 'text-green-600' 
                            : product.quantity > 0 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                          {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      {product.weight && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {product.weight} {product.weightUnit}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                        product.quantity === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95'
                      }`}
                      disabled={product.quantity === 0}
                    >
                      {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Empty State */}
          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Products Found</h3>
                <p className="text-gray-600 mb-8">
                  We couldn't find any products in this category. Check back later or explore other categories.
                </p>
                <Link 
                  href="/category"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Browse All Categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}