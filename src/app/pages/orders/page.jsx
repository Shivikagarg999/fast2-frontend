"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OrdersPage() {
  // Demo orders (hardcoded)
  const [orders] = useState([
    {
      _id: "ORD123456",
      createdAt: "2025-09-15T10:30:00Z",
      status: "Delivered",
      totalAmount: 899,
      items: [
        {
          name: "Amul Milk 1L",
          quantity: 2,
          price: 120,
          imageUrl:
            "https://ik.imagekit.io/demo/img/image1.jpg",
        },
        {
          name: "Fortune Oil 5L",
          quantity: 1,
          price: 759,
          imageUrl:
            "https://ik.imagekit.io/demo/img/image2.jpg",
        },
      ],
    },
    {
      _id: "ORD654321",
      createdAt: "2025-09-17T16:45:00Z",
      status: "On the way",
      totalAmount: 349,
      items: [
        {
          name: "Bananas (1 Dozen)",
          quantity: 1,
          price: 59,
          imageUrl:
            "https://ik.imagekit.io/demo/img/image3.jpg",
        },
        {
          name: "Parle-G Biscuits",
          quantity: 5,
          price: 290,
          imageUrl:
            "https://ik.imagekit.io/demo/img/image4.jpg",
        },
      ],
    },
  ]);

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <h2 className="text-lg font-semibold mb-4">My Orders</h2>
        <p className="text-gray-600">You have no orders yet.</p>
        <Link
          href="/"
          className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h2 className="text-lg font-semibold mb-6">My Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            {/* Order header */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()} •{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "On the way"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Order items */}
            <div className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center py-3">
                  <div className="w-14 h-14 relative rounded-md overflow-hidden border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">₹{item.price}</p>
                </div>
              ))}
            </div>

            {/* Footer row */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium">Total: ₹{order.totalAmount}</p>
              <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                Reorder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
