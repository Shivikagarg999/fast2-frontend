"use client"

import React from 'react';
import Link from 'next/link';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
    MapPinIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const ShopCard = ({ shop = {} }) => {
    const getRatingColor = (avg) => {
        if (avg >= 4) return 'bg-green-500';
        if (avg >= 3) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const defaultLogo = 'https://via.placeholder.com/80x80?text=Shop';

    return (
        <Link href={`/shops/${shop.shopSlug}`}>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col">
                {/* Cover Image */}
                <div className="relative h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 overflow-hidden">
                    {shop.coverImage?.url ? (
                        <img
                            src={shop.coverImage.url}
                            alt={shop.shopName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 opacity-80" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        {shop.isVerified && (
                            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                <CheckBadgeIcon className="w-3.5 h-3.5" />
                                Verified
                            </span>
                        )}
                        {!shop.isOpen && (
                            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                Closed
                            </span>
                        )}
                    </div>
                </div>

                {/* Logo + Info */}
                <div className="px-4 -mt-7 relative z-10">
                    <div className="w-14 h-14 rounded-xl border-3 border-white shadow-md overflow-hidden bg-white flex items-center justify-center">
                        <img
                            src={shop.logo?.url || defaultLogo}
                            alt={shop.shopName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = defaultLogo; }}
                        />
                    </div>
                </div>

                <div className="p-4 pt-2 flex-1 flex flex-col">
                    {/* Shop Name */}
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {shop.shopName || 'Unnamed Shop'}
                    </h3>

                    {/* Tagline */}
                    {shop.tagline && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{shop.tagline}</p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                        {shop.rating?.average > 0 ? (
                            <div className={`flex items-center gap-1 ${getRatingColor(shop.rating.average)} text-white text-xs font-bold px-2 py-0.5 rounded-md`}>
                                <StarSolidIcon className="w-3 h-3" />
                                {shop.rating.average.toFixed(1)}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">New</span>
                        )}
                        {shop.rating?.totalReviews > 0 && (
                            <span className="text-xs text-gray-500">
                                {shop.rating.totalReviews} review{shop.rating.totalReviews > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
                        {shop.analytics?.totalProductsListed > 0 && (
                            <div className="flex items-center gap-1">
                                <ShoppingBagIcon className="w-3.5 h-3.5" />
                                <span>{shop.analytics.totalProductsListed} Products</span>
                            </div>
                        )}
                        {shop.followersCount > 0 && (
                            <div className="flex items-center gap-1">
                                <UserGroupIcon className="w-3.5 h-3.5" />
                                <span>{shop.followersCount >= 1000 ? `${(shop.followersCount / 1000).toFixed(1)}k` : shop.followersCount} Followers</span>
                            </div>
                        )}
                    </div>

                    {/* City */}
                    <div className="mt-auto">
                        {shop.address?.city && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <MapPinIcon className="w-3.5 h-3.5" />
                                <span>{shop.address.city}{shop.address.state ? `, ${shop.address.state}` : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ShopCard;
