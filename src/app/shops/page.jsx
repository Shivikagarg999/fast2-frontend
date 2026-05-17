'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    ChevronDownIcon,
    BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import ShopCard from '../components/shopCard/page';
import Footer from '../components/footer/page';

const API_BASE = 'https://www.fast2.in/proxy';

function ShopsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalShops: 0,
        hasNext: false,
    });

    // Filter states
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
    const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
    const [verified, setVerified] = useState(searchParams.get('verified') || '');
    const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
    const [showFilters, setShowFilters] = useState(false);
    const [searchInput, setSearchInput] = useState(search);

    // Sync pincode with localStorage on mount
    useEffect(() => {
        if (!searchParams.get('pincode')) {
            const savedPincode = localStorage.getItem('userPincode');
            if (savedPincode) {
                setPincode(savedPincode);
            }
        }
    }, [searchParams]);

    // Listen for global location updates
    useEffect(() => {
        const handleLocationUpdate = (e) => {
            if (e.detail?.pincode) {
                setPincode(e.detail.pincode);
            }
        };
        window.addEventListener('locationUpdated', handleLocationUpdate);
        return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
    }, []);

    const fetchShops = useCallback(
        async (page = 1, append = false) => {
            try {
                if (append) {
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                }

                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('limit', '20');
                if (search) params.append('search', search);
                if (city) params.append('city', city);
                if (sortBy) params.append('sortBy', sortBy);
                if (minRating) params.append('minRating', minRating);
                if (verified) params.append('verified', verified);
                if (pincode) params.append('pincode', pincode);

                const token = localStorage.getItem('token');
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${API_BASE}/api/shops?${params.toString()}`, { headers });
                const data = await res.json();

                if (data.success) {
                    if (append) {
                        setShops((prev) => [...prev, ...data.data]);
                    } else {
                        setShops(data.data);
                    }
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error('Error fetching shops:', error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [search, city, sortBy, minRating, verified, pincode]
    );

    useEffect(() => {
        fetchShops(1, false);
    }, [fetchShops]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const handleSort = (value) => {
        setSortBy(value);
    };

    const clearFilters = () => {
        setSearch('');
        setSearchInput('');
        setCity('');
        setSortBy('rating');
        setMinRating('');
        setVerified('');
        setPincode('');
    };

    const hasActiveFilters = search || city || minRating || verified || pincode || sortBy !== 'rating';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-600 to-pink-500 text-white">
                <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                            <BuildingStorefrontIcon className="w-6 h-6" />
                            <span className="text-lg font-medium">Explore Shops</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
                            <BuildingStorefrontIcon className="w-8 h-8 md:w-10 md:h-10" />
                            Discover Amazing Shops
                        </h1>
                        <p className="text-white/80 mb-8 max-w-lg mx-auto">
                            Browse through verified sellers and find the best products near you
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
                            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-4" />
                                <input
                                    type="text"
                                    className="flex-1 py-3.5 px-3 text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none"
                                    placeholder="Search shops by name..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                                {searchInput && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchInput('');
                                            setSearch('');
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 font-semibold text-sm transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => handleSort(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-full px-4 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:border-purple-300 focus:outline-none focus:border-purple-400"
                            >
                                <option value="rating">Top Rated</option>
                                <option value="orders">Most Orders</option>
                                <option value="newest">Newest</option>
                                <option value="followers">Most Followed</option>
                            </select>
                            <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Rating Filter */}
                        <div className="flex gap-1">
                            {[4, 3, 2].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setMinRating(minRating === r.toString() ? '' : r.toString())}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium border transition-colors ${minRating === r.toString()
                                        ? 'bg-purple-50 border-purple-300 text-purple-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <StarSolidIcon className="w-3 h-3 text-yellow-400" />
                                    {r}+
                                </button>
                            ))}
                        </div>

                        {/* Verified only */}
                        <button
                            onClick={() => setVerified(verified === 'true' ? '' : 'true')}
                            className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${verified === 'true'
                                ? 'bg-purple-50 border-purple-300 text-purple-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            ✓ Verified Only
                        </button>

                        {/* City filter */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Filter by city..."
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 w-36 focus:outline-none focus:border-purple-400 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Pincode filter */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Pincode..."
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 w-28 focus:outline-none focus:border-purple-400 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 pb-12">
                {/* Result count */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BuildingStorefrontIcon className="w-4 h-4" />
                        <span>
                            {loading
                                ? 'Loading shops...'
                                : `${pagination.totalShops} shop${pagination.totalShops !== 1 ? 's' : ''} found`}
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="h-28 bg-gray-200" />
                                <div className="p-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-xl -mt-10 mb-3" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                                    <div className="h-5 bg-gray-100 rounded-md w-12 mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : shops.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20">
                        <BuildingStorefrontIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No shops found</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <BuildingStorefrontIcon className="w-4 h-4" />
                            <span>Try adjusting your filters or search terms</span>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Shop Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {shops.map((shop) => (
                                <ShopCard key={shop._id} shop={shop} />
                            ))}
                        </div>

                        {/* Load More */}
                        {pagination.hasNext && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => fetchShops(pagination.currentPage + 1, true)}
                                    disabled={loadingMore}
                                    className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                            Loading more...
                                        </span>
                                    ) : (
                                        `Show More Shops (${pagination.totalShops - shops.length} remaining)`
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default function ShopsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                </div>
            }
        >
            <ShopsContent />
        </Suspense>
    );
}
