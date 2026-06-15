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
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">

                {/* Cover image with overlay + text */}
                <div className="relative h-28 overflow-hidden">
                    {shop.coverImage?.url ? (
                        <img
                            src={shop.coverImage.url}
                            alt={shop.shopName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-600 to-emerald-800" />
                    )}

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

                    {/* Badges top-right */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
                        {shop.isVerified && (
                            <span className="flex items-center gap-1 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <CheckBadgeIcon className="w-3 h-3" />
                                Verified
                            </span>
                        )}
                        {shop.shopType === 'medical' && (
                            <span className="bg-blue-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Medical
                            </span>
                        )}
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isShopOpen() ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                        }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            {isShopOpen() ? 'Open' : 'Closed'}
                        </span>
                    </div>

                    {/* Shop name + tagline over the image */}
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 z-10">
                        <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 drop-shadow">
                            {shop.shopName || 'Unnamed Shop'}
                        </h3>
                        {shop.tagline && (
                            <p className="text-white/80 text-[11px] line-clamp-1 drop-shadow">{shop.tagline}</p>
                        )}
                    </div>

                    {/* Logo */}
                    <div className="absolute bottom-2 right-3 w-10 h-10 rounded-lg border-2 border-white shadow overflow-hidden bg-white flex items-center justify-center z-10">
                        {shop.logo?.url ? (
                            <img src={shop.logo.url} alt={shop.shopName} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-5 h-5 text-gray-300" />
                        )}
                    </div>
                </div>

                {/* Card body */}
                <div className="p-3">

                {/* Rating + Stats row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {shop.rating?.average > 0 ? (
                        <div className={`flex items-center gap-1 ${getRatingColor(shop.rating.average)} text-white text-xs font-bold px-2 py-0.5 rounded-md`}>
                            <StarSolidIcon className="w-3 h-3" />
                            {shop.rating.average.toFixed(1)}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">New</span>
                    )}
                    {shop.rating?.totalReviews > 0 && (
                        <span className="text-xs text-gray-500">{shop.rating.totalReviews} reviews</span>
                    )}
                    {shop.analytics?.totalProductsListed > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-gray-500">
                            <ShoppingBagIcon className="w-3 h-3" />
                            <span>{shop.analytics.totalProductsListed}</span>
                        </div>
                    )}
                    {shop.followersCount > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-gray-500">
                            <UserGroupIcon className="w-3 h-3" />
                            <span>{shop.followersCount >= 1000 ? `${(shop.followersCount / 1000).toFixed(1)}k` : shop.followersCount}</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {shop.address?.city && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span>{shop.address.city}{shop.address.state ? `, ${shop.address.state}` : ''}</span>
                    </div>
                )}
                </div>
            </div>
        </Link>
    );
};

export default ShopCard;
