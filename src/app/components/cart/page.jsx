'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cartEvents } from '../header/page';

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Sample products data using images from the product listing
  const sampleProducts = [
    {
      id: 1,
      name: "Fresh Potatoes",
      description: "Farm fresh, 1 kg",
      price: 35,
      quantity: 2,
      image: "https://i.pinimg.com/736x/b6/c4/cd/b6c4cde196e12850d64cc6570eef7674.jpg"
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      description: "Organic red, 500 g",
      price: 25,
      quantity: 1,
      image: "https://i.pinimg.com/736x/f2/7c/1a/f27c1a4fdcc547bbced51a424492be2f.jpg"
    },
    {
      id: 3,
      name: "Fresh Milk",
      description: "Pure cow milk, 500 ml",
      price: 30,
      quantity: 1,
      image: "https://i.pinimg.com/736x/24/1d/d3/241dd354a1303f9cbeb6ad04d70a4211.jpg"
    }
  ];

  // Initialize cart with sample data
  useEffect(() => {
    setCartItems(sampleProducts);
  }, []);

  // Subscribe to cart events from Header
  useEffect(() => {
    const handleOpenCart = () => {
      setIsOpen(true);
    };

    cartEvents.subscribe(handleOpenCart);

    return () => {
      cartEvents.unsubscribe(handleOpenCart);
    };
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* Cart Sidebar - slides in from right, NO OVERLAY */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-xl border-l border-gray-100 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Your Cart</h2>
            <p className="text-blue-100 text-sm mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={closeCart}
            className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-500"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-3xl mb-4 text-blue-200">
                🛒
              </div>
              <p className="text-lg font-medium text-gray-600">Your cart is empty</p>
              <p className="text-sm mt-2 text-gray-400">Add items to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm truncate">{item.name}</h3>
                      <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                      <p className="text-blue-600 font-bold mt-1">₹{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-blue-50 rounded-full px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 text-blue-700 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 text-blue-700 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Subtotal:</span>
              <span className="font-medium">₹{calculateTotal()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Delivery:</span>
              <span className="font-medium">{calculateTotal() > 0 ? '₹25' : '₹0'}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-blue-600">₹{calculateTotal() > 0 ? calculateTotal() + 25 : 0}</span>
            </div>
          </div>
          <button
            disabled={cartItems.length === 0}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              cartItems.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

      {/* Click outside area to close cart - invisible overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={closeCart}
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </>
  );
};

export default Cart;