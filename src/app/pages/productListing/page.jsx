'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '../../components/productCard/page';

const ProductListing = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      console.log('🔐 Auth check - Token exists:', !!token);
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    window.addEventListener('userLoggedIn', checkAuth);

    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('userLoggedIn', checkAuth);
    };
  }, []);

  // Helper function to safely get category name
  const getCategoryName = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category !== null && category.name) {
      return category.name;
    }
    if (typeof category === 'object' && category !== null) {
      return category._id || 'Unknown Category';
    }
    return 'Unknown Category';
  };

  // Helper function to safely get category ID
  const getCategoryId = (category) => {
    if (!category) return null;
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category !== null && category._id) {
      return category._id;
    }
    return null;
  };

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productsResponse = await fetch('https://api.fast2.in/api/product/');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        
        // Create a map of category IDs to names
        const categoriesMap = {};
        productsData.forEach(product => {
          if (product.category) {
            const categoryId = getCategoryId(product.category);
            const categoryName = getCategoryName(product.category);
            
            if (categoryId) {
              categoriesMap[categoryId] = categoryName;
            }
          }
        });
        
        setProducts(productsData);
        setCategories(categoriesMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch cart quantities if logged in
  useEffect(() => {
    const fetchCartQuantities = async () => {
      if (!isLoggedIn) {
        console.log('🚫 Not logged in, skipping cart fetch');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('🛒 Fetching cart with token:', token ? 'Present' : 'Missing');
        
        const response = await fetch('https://api.fast2.in/api/cart/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📡 Cart response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🛒 Cart data received:', data);
          
          const cartItems = data.items || data.cart?.items || data || [];
          const quantities = {};
          
          cartItems.forEach(item => {
            const productId = item.product?._id || item.productId || item._id;
            quantities[productId] = item.quantity || 0;
          });
          
          setCartQuantities(quantities);
          console.log('🛒 Cart quantities set:', quantities);
        } else if (response.status === 401) {
          console.log('🔴 401 Unauthorized - clearing token');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Error fetching cart quantities:', err);
      }
    };

    fetchCartQuantities();
  }, [isLoggedIn]);

  // Add to cart API call - FIXED ENDPOINT
  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');
      console.log('➕ Adding to cart - Product:', productId, 'Qty:', quantity);
      console.log('➕ Using token:', token);

      const response = await fetch('https://api.fast2.in/api/cart/add', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      console.log('📡 Add to cart response status:', response.status);
      
      const responseData = await response.json();
      console.log('📡 Add to cart response data:', responseData);

      if (response.ok) {
        setCartQuantities(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + quantity
        }));
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('✅ Added to cart successfully');
      } else {
        if (response.status === 401) {
          console.log('🔴 401 Unauthorized - clearing token');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setShowLoginPrompt(true);
          setTimeout(() => setShowLoginPrompt(false), 3000);
        }
        throw new Error(responseData.error || responseData.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert(err.message || 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Update cart quantity - FIXED ENDPOINT
  const updateCartQuantity = async (productId, newQuantity) => {
    if (!isLoggedIn) return;

    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const cartItems = await fetch('https://api.fast2.in/api/cart/', {  
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`https://api.fast2.in/api/cart/update/${cartItem._id}`, {  
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
          setCartQuantities(prev => ({
            ...prev,
            [productId]: newQuantity
          }));
        }
      }
    } catch (err) {
      console.error('Error updating cart:', err);
    }
  };

  // Remove from cart - FIXED ENDPOINT
  const removeFromCart = async (productId) => {
    if (!isLoggedIn) return;

    try {
      const token = localStorage.getItem('token');
      const cartItems = await fetch('/api/cart/', {  
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`/api/cart/remove/${cartItem._id}`, {  
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCartQuantities(prev => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Get available categories for filtering
  const availableCategories = ['All'];
  Object.values(categories).forEach(categoryName => {
    if (categoryName && !availableCategories.includes(categoryName)) {
      availableCategories.push(categoryName);
    }
  });

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => {
        const categoryName = getCategoryName(product.category);
        return categoryName === selectedCategory;
      });

  // Group products by category for "All" view
  const productsByCategory = {};
  products.forEach(product => {
    const categoryName = getCategoryName(product.category);
    const safeCategoryName = typeof categoryName === 'string' ? categoryName : String(categoryName);
    
    if (!productsByCategory[safeCategoryName]) {
      productsByCategory[safeCategoryName] = [];
    }
    productsByCategory[safeCategoryName].push(product);
  });

  const handleProductClick = (product) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    }
    router.push(`/product/${product._id}`);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {showLoginPrompt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg z-50">
          <p className="text-sm font-medium">Please login to add items to cart</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="max-w-8xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 py-6">
        {selectedCategory === 'All' ? (
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="bg-white rounded-xl overflow-hidden">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {category}
                    <span className="ml-3 text-sm font-normal text-gray-500">
                      ({categoryProducts.length} items)
                    </span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {categoryProducts.map(product => (
                      <ProductCard 
                        key={product._id} 
                        product={product} 
                        formatPrice={formatPrice} 
                        onProductClick={handleProductClick}
                        categoryName={getCategoryName(product.category)}
                        cartQuantity={cartQuantities[product._id] || 0}
                        onAddToCart={addToCart}
                        onUpdateQuantity={updateCartQuantity}
                        isAddingToCart={addingToCart[product._id] || false}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedCategory}
                <span className="ml-3 text-sm font-normal text-gray-500">
                  ({filteredProducts.length} items)
                </span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    formatPrice={formatPrice} 
                    onProductClick={handleProductClick}
                    categoryName={getCategoryName(product.category)}
                    cartQuantity={cartQuantities[product._id] || 0}
                    onAddToCart={addToCart}
                    onUpdateQuantity={updateCartQuantity}
                    isAddingToCart={addingToCart[product._id] || false}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-300 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;