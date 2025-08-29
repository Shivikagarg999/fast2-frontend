'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProductListing = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsResponse = await fetch('https://fast2-backend.onrender.com/api/product/');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        
        // Fetch categories for all products
        const categoryIds = [...new Set(productsData.map(product => product.category))];
        const categoryPromises = categoryIds.map(id => 
          fetch(`https://fast2-backend.onrender.com/api/category/${id}`).then(res => res.json())
        );
        
        const categoriesData = await Promise.all(categoryPromises);
        const categoriesMap = {};
        categoriesData.forEach(category => {
          categoriesMap[category._id] = category.name;
        });
        
        setProducts(productsData);
        setCategories(categoriesMap);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format price in Indian rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get unique categories for filtering
  const availableCategories = [...new Set(products.map(product => categories[product.category]))];
  availableCategories.unshift('All'); // Add "All" option at the beginning

  // Filter products by category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => categories[product.category] === selectedCategory);

  // Group products by category for the category-wise view
  const productsByCategory = {};
  products.forEach(product => {
    const categoryName = categories[product.category];
    if (!productsByCategory[categoryName]) {
      productsByCategory[categoryName] = [];
    }
    productsByCategory[categoryName].push(product);
  });

  // Handle product click - navigate to product detail page
  const handleProductClick = (product) => {
    // Store product data in sessionStorage so we can access it on the detail page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    }
    router.push(`/product/${product._id}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-4 px-4 font-sans bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-4 px-4 font-sans bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Products</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-4 px-4 font-sans bg-white">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
          <div className="text-sm text-gray-500">Delivery in 10 minutes</div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {availableCategories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Category-wise Product Sections (shown when "All" is selected) */}
        {selectedCategory === 'All' ? (
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {category}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {categoryProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      formatPrice={formatPrice} 
                      onProductClick={handleProductClick}
                      categoryName={categories[product.category]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Category View */
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {selectedCategory}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  formatPrice={formatPrice} 
                  onProductClick={handleProductClick}
                  categoryName={categories[product.category]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-300 text-5xl mb-4">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact Product Card Component (Blinkit style)
const ProductCard = ({ product, formatPrice, onProductClick, categoryName }) => {
  const [quantity, setQuantity] = useState(0);

  const handleAdd = (e) => {
    e.stopPropagation(); // Prevent triggering the product click when clicking add button
    setQuantity(quantity + 1);
  };

  const handleRemove = (e) => {
    e.stopPropagation(); // Prevent triggering the product click when clicking remove button
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const handleCardClick = () => {
    onProductClick(product);
  };

  // Generate a delivery time between 5-15 minutes
  const deliveryTime = `${Math.floor(Math.random() * 11) + 5} mins`;
  
  // Generate a rating between 3.5-5.0
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);

  return (
    <div 
      className="bg-white rounded-lg border border-gray-100 overflow-hidden transition-transform hover:shadow-md flex flex-col h-full cursor-pointer hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="h-28 bg-gray-100 flex items-center justify-center p-2">
        <img 
          src={product.image} 
          alt={product.name}
          className="object-contain h-full rounded"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=No+Image";
          }}
        />
      </div>
      
      {/* Product Details */}
      <div className="p-2 flex-grow flex flex-col">
        <h3 className="font-medium text-gray-800 text-xs mb-1 leading-tight">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.description}</p>
        
        <div className="flex items-center mb-2 mt-auto">
          <div className="flex items-center bg-blue-50 px-1.5 py-0.5 rounded">
            <span className="text-xs font-semibold text-blue-700">{rating}</span>
            <svg className="w-3 h-3 text-yellow-400 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 ml-1.5">• {deliveryTime}</span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-500 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          
          {quantity === 0 ? (
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2.5 rounded text-xs transition-colors"
              onClick={handleAdd}
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 bg-blue-100 rounded-full px-1.5 py-0.5">
              <button 
                className="text-blue-600 text-sm font-bold"
                onClick={handleRemove}
              >
                -
              </button>
              <span className="text-xs font-medium text-blue-600">{quantity}</span>
              <button 
                className="text-blue-600 text-sm font-bold"
                onClick={handleAdd}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;