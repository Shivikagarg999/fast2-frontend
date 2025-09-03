'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, MinusIcon, ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productsResponse = await fetch('https://fast2-backend.onrender.com/api/product/');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        
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
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://fast2-backend.onrender.com/api/cart/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const cartItems = data.items || data.cart?.items || data || [];
          const quantities = {};
          
          cartItems.forEach(item => {
            const productId = item.product?._id || item.productId || item._id;
            quantities[productId] = item.quantity || 0;
          });
          
          setCartQuantities(quantities);
        }
      } catch (err) {
        console.error('Error fetching cart quantities:', err);
      }
    };

    fetchCartQuantities();
  }, [isLoggedIn]);

  // Add to cart API call
  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://fast2-backend.onrender.com/api/cart/add', {
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

      if (response.ok) {
        // Update local quantity state
        setCartQuantities(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + quantity
        }));
        
        // Trigger cart update in header
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Update cart quantity
  const updateCartQuantity = async (productId, newQuantity) => {
    if (!isLoggedIn) return;

    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const cartItems = await fetch('https://fast2-backend.onrender.com/api/cart/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`https://fast2-backend.onrender.com/api/cart/update/${cartItem._id}`, {
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

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!isLoggedIn) return;

    try {
      const token = localStorage.getItem('token');
      const cartItems = await fetch('https://fast2-backend.onrender.com/api/cart/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`https://fast2-backend.onrender.com/api/cart/remove/${cartItem._id}`, {
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

  const availableCategories = [...new Set(products.map(product => categories[product.category]))];
  availableCategories.unshift('All');

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => categories[product.category] === selectedCategory);

  const productsByCategory = {};
  products.forEach(product => {
    const categoryName = categories[product.category];
    if (!productsByCategory[categoryName]) {
      productsByCategory[categoryName] = [];
    }
    productsByCategory[categoryName].push(product);
  });

  const handleProductClick = (product) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    }
    router.push(`/product/${product._id}`);
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-8xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 space-y-3">
                  <div className="h-28 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Login Prompt Toast */}
      {showLoginPrompt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          <p className="text-sm font-medium">Please login to add items to cart</p>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 py-6">
        {/* Product Grid */}
        {selectedCategory === 'All' ? (
          <div className="space-y-8">
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="w-3 h-3 rounded-full mr-3"></span>
                    {category}
                    <span className="ml-3 text-sm font-normal text-gray-500">
                      ({categoryProducts.length} items)
                    </span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoryProducts.map(product => (
                      <ProductCard 
                        key={product._id} 
                        product={product} 
                        formatPrice={formatPrice} 
                        onProductClick={handleProductClick}
                        categoryName={categories[product.category]}
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-3 h-3 rounded-full mr-3"></span>
                {selectedCategory}
                <span className="ml-3 text-sm font-normal text-gray-500">
                  ({filteredProducts.length} items)
                </span>
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    formatPrice={formatPrice} 
                    onProductClick={handleProductClick}
                    categoryName={categories[product.category]}
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

        {/* Empty state */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-gray-300 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ 
  product, 
  formatPrice, 
  onProductClick, 
  categoryName, 
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  isAddingToCart,
  isLoggedIn
}) => {
  const handleAdd = async (e) => {
    e.stopPropagation();
    await onAddToCart(product._id, 1);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (cartQuantity > 0) {
      await onUpdateQuantity(product._id, cartQuantity - 1);
    }
  };

  const handleIncrement = async (e) => {
    e.stopPropagation();
    await onUpdateQuantity(product._id, cartQuantity + 1);
  };

  const handleCardClick = () => {
    onProductClick(product);
  };

  const deliveryTime = `${Math.floor(Math.random() * 11) + 5} mins`;
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  const discountPercent = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null;

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative h-32 bg-white flex items-center justify-center p-3">
        {discountPercent && (
          <div className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded font-medium z-10">
            {discountPercent}% OFF
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name}
          className="object-contain h-full w-full"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
          }}
        />
      </div>
      
      {/* Product Details */}
      <div className="p-3 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{deliveryTime}</span>
            </div>
            <div className="flex items-center bg-blue-100 px-1.5 py-0.5 rounded">
              <StarSolidIcon className="w-3 h-3 text-blue-600 mr-0.5" />
              <span className="text-xs font-medium text-blue-700">{rating}</span>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.description}</p>
        </div>
        
        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Section */}
        <div className="mt-auto">
          {cartQuantity === 0 ? (
            <button 
              className={`w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors duration-200 ${
                isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleAdd}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? 'ADDING...' : 'ADD'}
            </button>
          ) : (
            <div className="flex items-center justify-between border-2 border-blue-600 bg-blue-600 text-white rounded-lg px-2 py-1">
              <button 
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
                onClick={handleRemove}
              >
                <MinusIcon className="w-3 h-3" />
              </button>
              
              <span className="font-bold text-sm px-2">
                {cartQuantity}
              </span>
              
              <button 
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded transition-colors"
                onClick={handleIncrement}
              >
                <PlusIcon className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;