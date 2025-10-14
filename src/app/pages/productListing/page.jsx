'use client'
import React, { useState, useEffect, useMemo, Suspense } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '../../components/productCard/page';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ProductListingComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const searchQuery = searchParams.get('search') || '';

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

  const getCategoryId = (category) => {
    if (!category) return null;
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category !== null && category._id) {
      return category._id;
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productsResponse = await fetch('https://api.fast2.in/api/product/');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        
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

  useEffect(() => {
    const fetchCartQuantities = async () => {
      if (!isLoggedIn) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('https://api.fast2.in/api/cart/', {
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
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Error fetching cart quantities:', err);
      }
    };

    fetchCartQuantities();
  }, [isLoggedIn]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');

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
      
      const responseData = await response.json();

      if (response.ok) {
        setCartQuantities(prev => ({
          ...prev,
          [productId]: (prev[productId] || 0) + quantity
        }));
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        if (response.status === 401) {
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

  const availableCategories = ['All'];
  Object.values(categories).forEach(categoryName => {
    if (categoryName && !availableCategories.includes(categoryName)) {
      availableCategories.push(categoryName);
    }
  });

  const searchedProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const filteredProducts = selectedCategory === 'All' 
    ? searchedProducts 
    : searchedProducts.filter(product => {
        const categoryName = getCategoryName(product.category);
        return categoryName === selectedCategory;
      });

  const productsByCategory = {};
  searchedProducts.forEach(product => {
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
      <div className="bg-white flex items-center justify-center">
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
    <div className="bg-white">
      {showLoginPrompt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg z-50">
          <p className="text-sm font-medium">Please login to add items to cart</p>
        </div>
      )}
      <div className="max-w-8xl mx-auto px-4 py-6">
        {selectedCategory === 'All' ? (
          <div className="space-y-8">
            {Object.keys(productsByCategory).length > 0 ? (
              Object.entries(productsByCategory).map(([category, categoryProducts]) => (
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
              ))
            ) : (
                <div className="text-center py-16">
                    <div className="text-gray-300 text-6xl mb-4">
                      <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      No products found for "{searchQuery}"
                    </h3>
                    <p className="text-gray-500">Try a different search term.</p>
                </div>
            )}
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

        {filteredProducts.length === 0 && !loading && searchQuery && selectedCategory !== 'All' && (
          <div className="text-center py-16">
            <div className="text-gray-300 text-6xl mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No products found for "{searchQuery}" in this category
            </h3>
            <p className="text-gray-500">Try a different search term or check other categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// ADDED: A new wrapper component to handle the Suspense boundary.
const ProductListing = () => {
  // This is the loading UI that was already in your component.
  // We use it as a fallback for Suspense.
  const fallback = (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <ProductListingComponent />
    </Suspense>
  );
};

export default ProductListing;