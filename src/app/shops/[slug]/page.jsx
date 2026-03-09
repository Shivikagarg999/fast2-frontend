'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    MapPinIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    StarIcon,
    HeartIcon,
    ShareIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    TruckIcon,
    ArrowPathIcon,
    HandThumbUpIcon,
    CheckBadgeIcon,
    ChatBubbleLeftIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';
import {
    StarIcon as StarSolidIcon,
    HeartIcon as HeartSolidIcon,
    HandThumbUpIcon as HandThumbUpSolidIcon,
} from '@heroicons/react/24/solid';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import Footer from '../../components/footer/page';

const API_BASE = 'https://api.fast2.in';

export default function ShopDetailPage() {
    const router = useRouter();
    const { slug } = useParams();

    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Product filters
    const [productPage, setProductPage] = useState(1);
    const [productPagination, setProductPagination] = useState({});
    const [productSearch, setProductSearch] = useState('');
    const [productSearchInput, setProductSearchInput] = useState('');
    const [productSort, setProductSort] = useState('createdAt');
    const [productSortOrder, setProductSortOrder] = useState('desc');
    const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

    // Review states
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewPagination, setReviewPagination] = useState({});
    const [reviewRatingFilter, setReviewRatingFilter] = useState('');
    const [shopRating, setShopRating] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Cart states
    const [cart, setCart] = useState({});
    const [addingToCart, setAddingToCart] = useState({});

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (slug) {
            fetchShop();
        }
    }, [slug]);

    useEffect(() => {
        if (shop?._id) {
            fetchProducts(1, false);
        }
    }, [shop?._id, productSearch, productSort, productSortOrder]);

    useEffect(() => {
        if (shop?._id && activeTab === 'reviews') {
            fetchReviews(1, false);
        }
    }, [shop?._id, activeTab, reviewRatingFilter]);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    setIsLoggedIn(!(payload.exp * 1000 < Date.now()));
                }
            } catch {
                setIsLoggedIn(false);
            }
        }
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    // ─── Fetch Shop ──────────────────────────────────────────────────────────────
    const fetchShop = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/shops/${slug}`, {
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setShop(data.data);
                setIsFollowing(data.data.isFollowing || false);
                setFollowersCount(data.data.followersCount || 0);
            }
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    // ─── Fetch Products ──────────────────────────────────────────────────────────
    const fetchProducts = async (page = 1, append = false) => {
        if (!shop?._id) return;
        try {
            if (append) setLoadingMoreProducts(true);
            else setProductsLoading(true);

            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (productSearch) params.append('search', productSearch);
            params.append('sortBy', productSort);
            params.append('sortOrder', productSortOrder);

            const res = await fetch(`${API_BASE}/api/shops/id/${shop._id}/products?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                if (append) {
                    setProducts((prev) => [...prev, ...data.data]);
                } else {
                    setProducts(data.data);
                }
                setProductPagination(data.pagination);
                setProductPage(page);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setProductsLoading(false);
            setLoadingMoreProducts(false);
        }
    };

    // ─── Fetch Reviews ───────────────────────────────────────────────────────────
    const fetchReviews = async (page = 1, append = false) => {
        if (!shop?._id) return;
        try {
            setReviewsLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '10');
            if (reviewRatingFilter) params.append('rating', reviewRatingFilter);

            const res = await fetch(`${API_BASE}/api/shops/id/${shop._id}/reviews?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                if (append) {
                    setReviews((prev) => [...prev, ...data.data]);
                } else {
                    setReviews(data.data);
                }
                setReviewPagination(data.pagination);
                setShopRating(data.rating);
                setReviewPage(page);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    // ─── Follow / Unfollow ───────────────────────────────────────────────────────
    const handleFollow = async () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/shops/id/${shop._id}/follow`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setIsFollowing(data.isFollowing);
                setFollowersCount(data.followersCount);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    // ─── Submit Review ───────────────────────────────────────────────────────────
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }
        try {
            setSubmittingReview(true);
            const res = await fetch(`${API_BASE}/api/shops/id/${shop._id}/reviews`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(reviewForm),
            });
            const data = await res.json();
            if (data.success) {
                setShowReviewForm(false);
                setReviewForm({ rating: 5, title: '', comment: '' });
                fetchReviews(1, false);
            } else {
                alert(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setSubmittingReview(false);
        }
    };

    // ─── Helpful Vote ────────────────────────────────────────────────────────────
    const handleHelpful = async (reviewId) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/shops/reviews/${reviewId}/helpful`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setReviews((prev) =>
                    prev.map((r) =>
                        r._id === reviewId ? { ...r, helpfulVotes: data.helpfulVotes, _voted: data.voted } : r
                    )
                );
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // ─── Add to Cart ─────────────────────────────────────────────────────────────
    const handleAddToCart = async (productId) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }
        try {
            setAddingToCart((prev) => ({ ...prev, [productId]: true }));
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            const data = await res.json();
            if (res.ok) {
                setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart((prev) => ({ ...prev, [productId]: false }));
        }
    };

    // ─── Product Search ──────────────────────────────────────────────────────────
    const handleProductSearch = (e) => {
        e.preventDefault();
        setProductSearch(productSearchInput);
    };

    const handleProductClick = (product) => {
        sessionStorage.setItem('selectedProduct', JSON.stringify(product));
        router.push(`/product/${product._id}`);
    };

    const getProductImage = (product) => {
        if (!product?.images || product.images.length === 0) {
            return 'https://via.placeholder.com/200x200?text=No+Image';
        }
        const primary = product.images.find((img) => img.isPrimary);
        return primary ? primary.url : product.images[0].url;
    };

    // ─── Share ───────────────────────────────────────────────────────────────────
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: shop.shopName, url });
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied!');
        }
    };

    // ─── RENDER ──────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    <div className="h-56 bg-gray-200" />
                    <div className="max-w-7xl mx-auto px-4 -mt-12">
                        <div className="flex items-end gap-4">
                            <div className="w-24 h-24 bg-gray-300 rounded-2xl" />
                            <div className="flex-1">
                                <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-4 bg-gray-100 rounded w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 mt-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                                    <div className="h-32 bg-gray-200 rounded-lg mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Shop not found</h2>
                    <button onClick={() => router.push('/shops')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Browse Shops
                    </button>
                </div>
            </div>
        );
    }

    const defaultLogo = 'https://via.placeholder.com/100x100?text=Shop';

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Login Prompt */}
            {showLoginPrompt && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                    <p className="text-sm font-medium">Please login to continue</p>
                </div>
            )}

            {/* Shop Header - No Images */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4">
                        {/* Shop Name and Badges */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    {shop.shopName || 'Shop'}
                                </h1>
                                {shop.tagline && (
                                    <p className="text-gray-600 text-sm md:text-base mb-3">{shop.tagline}</p>
                                )}

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {shop.isVerified && (
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-sm font-bold px-3 py-1.5 rounded-full border border-blue-200">
                                            <CheckBadgeIcon className="w-4 h-4" />
                                            Verified Shop
                                        </span>
                                    )}
                                    {!shop.isOpen && (
                                        <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                                            Currently Closed
                                        </span>
                                    )}
                                    {shop.isFeatured && (
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                                            Featured
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shop Stats */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            {shop.rating?.average > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-md">
                                        <StarSolidIcon className="w-4 h-4" />
                                        <span className="font-bold">{shop.rating.average.toFixed(1)}</span>
                                    </div>
                                    <span className="text-gray-500">
                                        ({shop.rating.totalReviews} reviews)
                                    </span>
                                </div>
                            )}
                            
                            {shop.analytics?.totalProductsListed > 0 && (
                                <div className="flex items-center gap-1 text-gray-600">
                                    <ShoppingBagIcon className="w-4 h-4" />
                                    <span>{shop.analytics.totalProductsListed} Products</span>
                                </div>
                            )}
                            
                            {followersCount > 0 && (
                                <div className="flex items-center gap-1 text-gray-600">
                                    <UserGroupIcon className="w-4 h-4" />
                                    <span>{followersCount >= 1000 ? `${(followersCount / 1000).toFixed(1)}k` : followersCount} Followers</span>
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        {shop.address && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    {shop.address.street && <p>{shop.address.street}</p>}
                                    <p>
                                        {shop.address.city}{shop.address.state ? `, ${shop.address.state}` : ''} - {shop.address.pincode}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="mt-6 flex items-center border-b border-gray-200 gap-0">
                    {[
                        { key: 'products', label: 'Products', icon: ShoppingBagIcon },
                        { key: 'reviews', label: 'Reviews', icon: StarIcon },
                        { key: 'about', label: 'About', icon: MapPinIcon },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {key === 'reviews' && shop.rating?.totalReviews > 0 && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                                    {shop.rating.totalReviews}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── TAB: Products ──────────────────────────────────────────────────── */}
                {activeTab === 'products' && (
                    <div className="mt-6">
                        {/* Search & Sort */}
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                            <form onSubmit={handleProductSearch} className="flex-1 min-w-[200px] relative">
                                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products in this shop..."
                                    value={productSearchInput}
                                    onChange={(e) => setProductSearchInput(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-400"
                                />
                                {productSearchInput && (
                                    <button
                                        type="button"
                                        onClick={() => { setProductSearchInput(''); setProductSearch(''); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </form>
                            <select
                                value={`${productSort}-${productSortOrder}`}
                                onChange={(e) => {
                                    const [s, o] = e.target.value.split('-');
                                    setProductSort(s);
                                    setProductSortOrder(o);
                                }}
                                className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-blue-400"
                            >
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A-Z</option>
                            </select>
                        </div>

                        {productsLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
                                        <div className="h-32 bg-gray-200 rounded-lg mb-3" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                                        <div className="h-8 bg-gray-100 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16">
                                <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">No products found</h3>
                                <p className="text-gray-500">This shop hasn&apos;t listed any products yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {products.map((product) => (
                                        <div
                                            key={product._id}
                                            className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col"
                                        >
                                            {/* Product Image */}
                                            <div
                                                className="relative h-36 bg-gray-50 flex items-center justify-center p-3"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.name}
                                                    className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
                                                />
                                                {product.discountPercentage > 0 && (
                                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                        {product.discountPercentage}% OFF
                                                    </div>
                                                )}
                                                {product.stockStatus === 'out-of-stock' && (
                                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                        <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-3 flex-1 flex flex-col" onClick={() => handleProductClick(product)}>
                                                {product.delivery?.deliveryCharges > 0 ? (
                                                    <span className="text-xs text-gray-500 mb-1">
                                                        Delivery: ₹{product.delivery.deliveryCharges}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-green-600 font-medium mb-1">Free Delivery</span>
                                                )}

                                                <h3 className="font-medium text-gray-900 text-sm mb-1 leading-tight line-clamp-2">
                                                    {product.name}
                                                </h3>

                                                {product.weight && (
                                                    <p className="text-xs text-gray-500 mb-2 font-bold">
                                                        {product.weight} {product.weightUnit || ''}
                                                    </p>
                                                )}

                                                <div className="mt-auto">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                                                        {product.oldPrice > 0 && product.oldPrice > product.price && (
                                                            <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Add to Cart */}
                                            <div className="px-3 pb-3">
                                                {product.stockStatus !== 'out-of-stock' && (
                                                    cart[product._id] ? (
                                                        <div className="flex items-center justify-center bg-blue-600 text-white rounded-lg h-9 text-sm font-bold">
                                                            ✓ Added ({cart[product._id]})
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                                                            disabled={addingToCart[product._id]}
                                                            className="w-full bg-blue-50 border border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                                        >
                                                            {addingToCart[product._id] ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                                    Adding
                                                                </span>
                                                            ) : (
                                                                'ADD'
                                                            )}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Load More Products */}
                                {productPagination.hasNext && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={() => fetchProducts(productPage + 1, true)}
                                            disabled={loadingMoreProducts}
                                            className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            {loadingMoreProducts ? 'Loading...' : 'Load More Products'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── TAB: Reviews ───────────────────────────────────────────────────── */}
                {activeTab === 'reviews' && (
                    <div className="mt-6">
                        {/* Rating Summary */}
                        {shopRating && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                                <div className="flex items-center gap-8 flex-wrap">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-gray-900">{shopRating.average?.toFixed(1) || '0.0'}</div>
                                        <div className="flex items-center gap-0.5 mt-1 justify-center">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <StarSolidIcon
                                                    key={s}
                                                    className={`w-4 h-4 ${s <= Math.round(shopRating.average || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{shopRating.totalReviews || 0} reviews</p>
                                    </div>

                                    {/* Breakdown bars */}
                                    <div className="flex-1 space-y-1.5 min-w-[200px]">
                                        {[
                                            { label: '5', count: shopRating.breakdown?.five || 0 },
                                            { label: '4', count: shopRating.breakdown?.four || 0 },
                                            { label: '3', count: shopRating.breakdown?.three || 0 },
                                            { label: '2', count: shopRating.breakdown?.two || 0 },
                                            { label: '1', count: shopRating.breakdown?.one || 0 },
                                        ].map(({ label, count }) => {
                                            const pct = shopRating.totalReviews > 0 ? (count / shopRating.totalReviews) * 100 : 0;
                                            return (
                                                <div key={label} className="flex items-center gap-2 text-sm">
                                                    <span className="w-3 text-gray-500 text-xs font-medium">{label}</span>
                                                    <StarSolidIcon className="w-3 h-3 text-yellow-400" />
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="w-8 text-xs text-gray-400 text-right">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Write Review */}
                                    <div>
                                        <button
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Write a Review
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Review Form */}
                        {showReviewForm && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                                <h3 className="font-bold text-gray-900 mb-4">Write Your Review</h3>
                                <form onSubmit={handleSubmitReview}>
                                    {/* Star Selector */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                                className="p-0.5"
                                            >
                                                <StarSolidIcon
                                                    className={`w-8 h-8 transition-colors ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-500">{reviewForm.rating}/5</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Review title (optional)"
                                        value={reviewForm.title}
                                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-blue-400"
                                        maxLength={100}
                                    />
                                    <textarea
                                        placeholder="Share your experience with this shop..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:border-blue-400 resize-none h-24"
                                        maxLength={1000}
                                    />
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm(false)}
                                            className="text-gray-500 text-sm hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Rating filter pills */}
                        <div className="flex items-center gap-2 mb-5 overflow-x-auto">
                            <button
                                onClick={() => setReviewRatingFilter('')}
                                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${!reviewRatingFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                                    }`}
                            >
                                All
                            </button>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReviewRatingFilter(reviewRatingFilter === r.toString() ? '' : r.toString())}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${reviewRatingFilter === r.toString() ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                >
                                    <StarSolidIcon className="w-3 h-3 text-yellow-400" />
                                    {r}
                                </button>
                            ))}
                        </div>

                        {/* Reviews List */}
                        {reviewsLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                            <div>
                                                <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                                                <div className="h-3 bg-gray-100 rounded w-16" />
                                            </div>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                    </div>
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-16">
                                <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-700 mb-2">No reviews yet</h3>
                                <p className="text-gray-500 mb-4">Be the first to review this shop!</p>
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Write a Review
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="bg-white rounded-xl p-5 border border-gray-100">
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {review.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 text-sm">{review.user?.name || 'Anonymous'}</span>
                                                        {review.isVerifiedPurchase && (
                                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                                ✓ Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <StarSolidIcon
                                                                    key={s}
                                                                    className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        {review.title && (
                                            <h4 className="font-semibold text-gray-800 text-sm mb-1">{review.title}</h4>
                                        )}
                                        {review.comment && (
                                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.comment}</p>
                                        )}

                                        {/* Seller Response */}
                                        {review.sellerResponse?.message && (
                                            <div className="bg-blue-50 rounded-lg p-3 mt-3 border-l-3 border-blue-400">
                                                <p className="text-xs font-semibold text-blue-700 mb-1">Seller Response:</p>
                                                <p className="text-xs text-gray-700">{review.sellerResponse.message}</p>
                                            </div>
                                        )}

                                        {/* Helpful */}
                                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => handleHelpful(review._id)}
                                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                            >
                                                {review._voted ? (
                                                    <HandThumbUpSolidIcon className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <HandThumbUpIcon className="w-4 h-4" />
                                                )}
                                                Helpful {review.helpfulVotes > 0 && `(${review.helpfulVotes})`}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Load More Reviews */}
                                {reviewPagination.hasNext && (
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={() => fetchReviews(reviewPage + 1, true)}
                                            disabled={reviewsLoading}
                                            className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Load More Reviews
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: About ───────────────────────────────────────────────────── */}
                {activeTab === 'about' && (
                    <div className="mt-6 space-y-6">
                        {/* About */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3">About {shop.shopName}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {shop.description || 'No description available'}
                            </p>
                        </div>

                        {/* Seller Info */}
                        {shop.seller && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3">Seller Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Seller Name</span>
                                        <span className="font-medium">{shop.seller.name}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Business Name</span>
                                        <span className="font-medium">{shop.seller.businessName}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        {shop.address?.city && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3">Location</h3>
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPinIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        {shop.address.street && <p>{shop.address.street}</p>}
                                        <p>
                                            {shop.address.city}
                                            {shop.address.state ? `, ${shop.address.state}` : ''}
                                            {shop.address.pincode ? ` - ${shop.address.pincode}` : ''}
                                        </p>
                                        <p>{shop.address.country || 'India'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Policies */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shop.returnPolicy && (
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ArrowPathIcon className="w-5 h-5 text-green-500" />
                                        <h3 className="font-bold text-gray-900">Return Policy</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {shop.returnPolicy.isReturnable
                                            ? `${shop.returnPolicy.returnWindowDays}-day returns accepted`
                                            : 'No returns accepted'}
                                    </p>
                                    {shop.returnPolicy.description && (
                                        <p className="text-xs text-gray-500 mt-2">{shop.returnPolicy.description}</p>
                                    )}
                                </div>
                            )}

                            {shop.shippingPolicy && (
                                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TruckIcon className="w-5 h-5 text-blue-500" />
                                        <h3 className="font-bold text-gray-900">Shipping Policy</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Estimated delivery: {shop.shippingPolicy.estimatedDeliveryDays || 5} days
                                    </p>
                                    {shop.shippingPolicy.freeShippingAbove > 0 && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Free shipping on orders above ₹{shop.shippingPolicy.freeShippingAbove}
                                        </p>
                                    )}
                                    {shop.shippingPolicy.description && (
                                        <p className="text-xs text-gray-500 mt-2">{shop.shippingPolicy.description}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Social Links */}
                        {shop.socialLinks && (shop.socialLinks.instagram || shop.socialLinks.facebook || shop.socialLinks.website) && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3">Follow Us</h3>
                                <div className="flex gap-3">
                                    {shop.socialLinks.instagram && (
                                        <a href={shop.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600 transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /></svg>
                                        </a>
                                    )}
                                    {shop.socialLinks.facebook && (
                                        <a href={shop.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                                        </a>
                                    )}
                                    {shop.socialLinks.website && (
                                        <a href={shop.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium underline">
                                            Visit Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-10">
                <Footer />
            </div>
        </div>
    );
}
