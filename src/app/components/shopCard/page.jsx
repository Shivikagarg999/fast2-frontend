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
    BuildingOfficeIcon as Building2,
} from '@heroicons/react/24/outline';

const ShopCard = ({ shop = {} }) => {
    const getRatingColor = (avg) => {
        if (avg >= 4) return 'bg-green-500';
        if (avg >= 3) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const isShopOpen = () => {
        if (!shop.timings) return true; // Default to open if no timings set
        
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[now.getDay()];
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

        const todayTimings = shop.timings[currentDay];
        
        if (!todayTimings || todayTimings.closed) {
            return false;
        }

        if (!todayTimings.open || !todayTimings.close) {
            return false;
        }

        return currentTime >= todayTimings.open && currentTime <= todayTimings.close;
    };

    const getNextOpenTime = () => {
        if (!shop.timings) return null;
        
        const now = new Date();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(now);
            checkDate.setDate(now.getDate() + i);
            const dayName = days[checkDate.getDay()];
            const dayTimings = shop.timings[dayName];
            
            if (dayTimings && !dayTimings.closed && dayTimings.open && dayTimings.close) {
                if (i === 0) {
                    // Today
                    const currentTime = now.toTimeString().slice(0, 5);
                    if (currentTime < dayTimings.open) {
                        return { day: dayName, time: dayTimings.open, isToday: true };
                    }
                } else {
                    // Future day
                    return { day: dayName, time: dayTimings.open, isToday: false };
                }
            }
        }
        
        return null;
    };

    return (
        <Link href={`/shops/${shop.shopSlug}`}>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                {/* Shop Media */}
                <div className="flex gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        {shop.logo?.url ? (
                            <img src={shop.logo.url} alt={shop.shopName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                            <Building2 className="w-8 h-8 text-gray-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                            {shop.shopName || 'Unnamed Shop'}
                        </h3>
                        {shop.tagline && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shop.tagline}</p>
                        )}
                    </div>
                </div>

                {/* Header Section (Removed old name/tagline block since it's now in Media block) */}
                <div className="flex items-start justify-between mb-3 absolute top-4 right-4 z-10">
                    {/* Badges */}
                    <div className="flex flex-col gap-1 items-end">
                        {shop.isVerified && (
                            <span className="flex items-center gap-1 bg-blue-50/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full border border-blue-200">
                                <CheckBadgeIcon className="w-3 h-3" />
                                Verified
                            </span>
                        )}
                        {shop.shopType === 'medical' && (
                            <span className="bg-emerald-100/90 backdrop-blur-sm text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                                Medical
                            </span>
                        )}
                        {/* Shop Status */}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${
                            isShopOpen() 
                                ? 'bg-green-50/90 backdrop-blur-sm text-green-600 border-green-200' 
                                : 'bg-red-50/90 backdrop-blur-sm text-red-600 border-red-200'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${
                                isShopOpen() ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            {isShopOpen() ? 'Open' : 'Closed'}
                        </span>
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
