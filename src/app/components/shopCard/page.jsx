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

    return (
        <Link href={`/shops/${shop.shopSlug}`}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                {/* Header with Badge */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                            {shop.shopName || 'Unnamed Shop'}
                        </h3>
                        {shop.tagline && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shop.tagline}</p>
                        )}
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-col gap-1 ml-3">
                        {shop.isVerified && (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full border border-blue-200">
                                <CheckBadgeIcon className="w-3.5 h-3.5" />
                                Verified
                            </span>
                        )}
                        {!shop.isOpen && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Closed
                            </span>
                        )}
                    </div>
                </div>

                {/* Rating Section */}
                <div className="flex items-center gap-3 mb-3">
                    {shop.rating?.average > 0 ? (
                        <div className={`flex items-center gap-1 ${getRatingColor(shop.rating.average)} text-white text-sm font-bold px-3 py-1 rounded-md`}>
                            <StarSolidIcon className="w-4 h-4" />
                            {shop.rating.average.toFixed(1)}
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-md">New Shop</span>
                    )}
                    {shop.rating?.totalReviews > 0 && (
                        <span className="text-sm text-gray-500">
                            {shop.rating.totalReviews} review{shop.rating.totalReviews > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Shop Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                    {shop.analytics?.totalProductsListed > 0 && (
                        <div className="flex items-center gap-1">
                            <ShoppingBagIcon className="w-4 h-4" />
                            <span>{shop.analytics.totalProductsListed} Products</span>
                        </div>
                    )}
                    {shop.followersCount > 0 && (
                        <div className="flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4" />
                            <span>{shop.followersCount >= 1000 ? `${(shop.followersCount / 1000).toFixed(1)}k` : shop.followersCount} Followers</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {shop.address?.city && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 pt-2 border-t border-gray-100">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{shop.address.city}{shop.address.state ? `, ${shop.address.state}` : ''}</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ShopCard;
