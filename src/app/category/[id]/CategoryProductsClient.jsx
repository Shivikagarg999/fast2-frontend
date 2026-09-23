"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/app/components/footer/page";
import ProductCard from "@/app/components/productCard/page";
import { getProductPath } from "@/app/utils/productSlug";
import ProductGridSkeleton from "@/app/components/skeletons/ProductGridSkeleton";
import NotServiceable from "@/app/components/notServiceable/NotServiceable";
import PageNotFound from "@/app/components/notFound/PageNotFound";

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
  const [needsLocation, setNeedsLocation] = useState(false);
  const [notFoundPage, setNotFoundPage] = useState(false);

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
        setNotFoundPage(false);

        const categoryResponse = await fetch(
          `/proxy/api/category/${categoryId}`
        );

        if (categoryResponse.status === 404) {
          setNotFoundPage(true);
          return;
        }
        if (!categoryResponse.ok) {
          throw new Error(`Category fetch failed: ${categoryResponse.status}`);
        }

        const categoryData = await categoryResponse.json();
        setCategory(categoryData);

        const location = JSON.parse(localStorage.getItem('userLocationData') || 'null');
        if (location?.latitude == null || location?.longitude == null) {
          // Not an error - just ask for a location instead of a scary full-page error.
          setNeedsLocation(true);
          setProducts([]);
          return;
        }
        setNeedsLocation(false);

        const locationParams = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude)
        });
        const productsResponse = await fetch(
          `/proxy/api/product/category/${categoryData._id}?${locationParams}`
        );
        
        if (!productsResponse.ok) {
          throw new Error(`Products fetch failed: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();

        setProducts(productsData.products || productsData || []);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) fetchCategoryData();

    window.addEventListener('locationUpdated', fetchCategoryData);
    return () => window.removeEventListener('locationUpdated', fetchCategoryData);
  }, [categoryId]);

  // Fetch cart quantities
  useEffect(() => {
    const fetchCartQuantities = async () => {
      if (!isLoggedIn) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/proxy/api/cart/', {
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
  const addToCart = async (productId, quantity = 1, price) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/proxy/api/cart/add', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity,
          price
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
      const cartItems = await fetch('/proxy/api/cart/', {  
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`/proxy/api/cart/update/${cartItem._id}`, {  
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
      const cartItems = await fetch('/proxy/api/cart/', {  
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      const items = cartItems.items || cartItems.cart?.items || cartItems || [];
      const cartItem = items.find(item => 
        (item.product?._id || item.productId) === productId
      );

      if (cartItem) {
        const response = await fetch(`/proxy/api/cart/remove/${cartItem._id}`, {  
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
    router.push(getProductPath(product));
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
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  if (notFoundPage) {
    return <PageNotFound />;
  }

  if (needsLocation) {
    return (
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Set your delivery location</h3>
          <p className="text-gray-500 mb-6">
            We'll show you what's available near you as soon as you set your location.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openLocationPrompt'))}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl"
          >
            Set Location
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-800 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">We couldn't load this page. Please try again.</p>
          <button
            onClick={() => router.push("/category")}
            className="bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-lg"
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
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-brand-600 text-white px-6 py-3 rounded-lg z-50">
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
                  className="text-brand-600 hover:text-brand-800 font-medium transition-colors"
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
                  className="text-brand-600 hover:text-brand-800 font-medium transition-colors"
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
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
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
            <NotServiceable
              message="This category doesn't have items available at your location right now. Try a different location, or explore other categories."
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

// Suspense wrapper
const CategoryProductsClient = () => {
  const fallback = (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback}>
      <CategoryProductsComponent />
    </Suspense>
  );
};

export default CategoryProductsClient;
