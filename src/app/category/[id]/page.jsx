"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/footer/page";
import ProductCard from "@/app/components/productCard/page";

const CustomImage = ({ src, alt, fallback, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      unoptimized={true} 
      {...props}
    />
  );
};

const CategoryProductsComponent = () => {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartQuantities, setCartQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const fallbackImage = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";

  // Authentication check
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

  // Fetch category and products data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const categoryResponse = await fetch(
          `https://www.fast2.in/proxy/api/category/${categoryId}`
        );
        
        if (!categoryResponse.ok) {
          throw new Error(`Category fetch failed: ${categoryResponse.status}`);
        }
        
        const categoryData = await categoryResponse.json();

        const productsResponse = await fetch(
          `https://www.fast2.in/proxy/api/product/category/${categoryId}`
        );
        
        if (!productsResponse.ok) {
          throw new Error(`Products fetch failed: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();

        setCategory(categoryData);
        setProducts(productsData.products || productsData || []);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) fetchCategoryData();
  }, [categoryId]);

  // Fetch cart quantities
  useEffect(() => {
    const fetchCartQuantities = async () => {
      if (!isLoggedIn) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('https://www.fast2.in/proxy/api/cart/', {
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

  // Cart functions
  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://www.fast2.in/proxy/api/cart/add', {  
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
      const cartItems = await fetch('https://www.fast2.in/proxy/api/cart/', {  
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`https://www.fast2.in/proxy/api/cart/update/${cartItem._id}`, {  
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
      const cartItems = await fetch('https://www.fast2.in/proxy/api/cart/', {  
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`https://www.fast2.in/proxy/api/cart/remove/${cartItem._id}`, {  
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

  const handleProductClick = (product) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedProduct', JSON.stringify(product));
    }
    router.push(`/product/${product._id}`);
  };

  // Fix category image URL
  const getCategoryImageUrl = (category) => {
    if (!category?.image) return fallbackImage;
    
    if (category.image.includes('/category/')) {
      return fallbackImage;
    }
    
    if (category.image.startsWith('/')) {
      return `https://www.fast2.in${category.image}`;
    }
    
    return category.image;
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Category</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/category")}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
          >
            Return to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white">
        {showLoginPrompt && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg z-50">
            <p className="text-sm font-medium">Please login to add items to cart</p>
          </div>
        )}
        
        <div className="max-w-8xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-3 text-sm bg-white px-4 py-2 rounded-full shadow-sm">
              <li>
                <Link
                  href="/"
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <Link
                  href="/category"
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li className="text-gray-700 font-semibold truncate max-w-xs">
                {category?.name || "Category"}
              </li>
            </ol>
          </nav>

          {/* Category Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {category?.image && (
              <div className="relative h-64 md:h-80">
                <CustomImage
                  src={getCategoryImageUrl(category)}
                  alt={category.name}
                  fallback={fallbackImage}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    {category?.name || "Category Products"}
                  </h1>
                  {category?.description && (
                    <p className="text-lg opacity-90 max-w-2xl">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {category?.name}
                  <span className="ml-3 text-sm font-normal text-gray-500">
                    ({products.length} items)
                  </span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {products.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      formatPrice={formatPrice} 
                      onProductClick={handleProductClick}
                      categoryName={category?.name || ""}
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
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products in this category.
                </p>
                <Link
                  href="/category"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Back to Categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

// Suspense wrapper
const CategoryProductsPage = () => {
  const fallback = (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <CategoryProductsComponent />
    </Suspense>
  );
};

export default CategoryProductsPage;