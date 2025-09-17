'use client';

import { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  MapPinIcon as MapPinSolidIcon,
  HomeIcon as HomeSolidIcon,
  BuildingOfficeIcon as OfficeSolidIcon
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // Form state for adding/editing addresses
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Check authentication status
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setError('Please login to view your addresses');
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setError('Please login to view your addresses');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.fast2.in/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      // Assuming addresses are stored in user.addresses
      setAddresses(data.user?.addresses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = getToken();
      if (!token) {
        setError('Please login to save addresses');
        return;
      }

      // Get current profile to update addresses array
      const profileResponse = await fetch('https://api.fast2.in/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      const currentAddresses = profileData.user?.addresses || [];
      
      let updatedAddresses;
      if (editingAddress) {
        // Update existing address
        updatedAddresses = currentAddresses.map(addr => 
          addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : addr
        );
      } else {
        // Add new address
        const newAddress = { 
          ...addressForm, 
          id: Date.now().toString() 
        };
        updatedAddresses = [...currentAddresses, newAddress];
      }

      // Update the profile with new addresses
      const updateResponse = await fetch('https://api.fast2.in/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: updatedAddresses
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(editingAddress ? 'Failed to update address' : 'Failed to add address');
      }

      const updateData = await updateResponse.json();
      setAddresses(updateData.user?.addresses || []);
      
      setSuccess(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      setDeleting(addressId);
      setError('');
      
      const token = getToken();
      if (!token) {
        setError('Please login to delete addresses');
        return;
      }

      // Get current profile
      const profileResponse = await fetch('https://api.fast2.in/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      const currentAddresses = profileData.user?.addresses || [];
      
      // Remove the address
      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);

      // Update the profile
      const updateResponse = await fetch('https://api.fast2.in/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: updatedAddresses
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to delete address');
      }

      const updateData = await updateResponse.json();
      setAddresses(updateData.user?.addresses || []);
      setSuccess('Address deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      setError('');
      
      const token = getToken();
      if (!token) {
        setError('Please login to set default address');
        return;
      }

      // Get current profile
      const profileResponse = await fetch('https://api.fast2.in/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      const currentAddresses = profileData.user?.addresses || [];
      
      // Set the address as default and remove default from others
      const updatedAddresses = currentAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      // Update the profile
      const updateResponse = await fetch('https://api.fast2.in/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: updatedAddresses
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to set default address');
      }

      const updateData = await updateResponse.json();
      setAddresses(updateData.user?.addresses || []);
      setSuccess('Default address updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setAddressForm({
      type: 'home',
      name: '',
      phone: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const startEdit = (address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type || 'home',
      name: address.name || '',
      phone: address.phone || '',
      address: address.address || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: address.isDefault || false
    });
    setShowAddForm(true);
  };

  const getAddressIcon = (type, isSelected = false) => {
    const IconComponent = isSelected ? 
      (type === 'home' ? HomeSolidIcon : type === 'work' ? OfficeSolidIcon : MapPinSolidIcon) :
      (type === 'home' ? HomeIcon : type === 'work' ? BuildingOfficeIcon : MapPinIcon);
    
    const colorClass = type === 'home' ? 'text-green-600' : 
                      type === 'work' ? 'text-blue-600' : 'text-purple-600';
    
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
  };

  const getAddressBadgeColor = (type) => {
    return type === 'home' ? 'bg-green-100 text-green-800' : 
           type === 'work' ? 'bg-blue-100 text-blue-800' : 
           'bg-purple-100 text-purple-800';
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blinkit-blue"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPinIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view addresses</h2>
          <p className="text-gray-600 mb-6">Manage your delivery addresses</p>
          <button 
            onClick={handleLoginRedirect}
            className="bg-blinkit-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blinkit-dark transition-colors shadow-md"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full -ml-2"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-2">Saved Addresses</h1>
            <div className="ml-auto">
              <span className="text-sm text-gray-500">{addresses.length} saved</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-800 font-bold text-lg">×</button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-800 font-bold text-lg">×</button>
            </div>
          </div>
        )}

        {/* Add New Address Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-white border-2 border-dashed border-blinkit-blue text-blinkit-blue rounded-xl p-6 mb-6 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-center">
              <PlusIcon className="w-6 h-6 mr-2" />
              <span className="font-medium">Add New Address</span>
            </div>
          </button>
        )}

        {/* Add/Edit Address Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Address Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
              <div className="flex space-x-3">
                {[
                  { value: 'home', label: 'Home', icon: HomeIcon },
                  { value: 'work', label: 'Work', icon: BuildingOfficeIcon },
                  { value: 'other', label: 'Other', icon: MapPinIcon }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAddressForm({...addressForm, type: value})}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      addressForm.type === value
                        ? 'border-blinkit-blue bg-blue-50 text-blinkit-blue'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={addressForm.name}
                onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
              <textarea
                value={addressForm.address}
                onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>

            {/* Landmark Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                value={addressForm.landmark}
                onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                placeholder="Nearby landmark"
              />
            </div>

            {/* City, State, Pincode Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                  placeholder="Pincode"
                />
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="defaultAddress"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                className="h-4 w-4 text-blinkit-blue focus:ring-blinkit-blue border-gray-300 rounded"
              />
              <label htmlFor="defaultAddress" className="ml-2 block text-sm text-gray-900">
                Set as default address
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={saveAddress}
                disabled={saving}
                className="flex-1 bg-blinkit-blue text-white py-3 rounded-lg font-medium hover:bg-blinkit-dark disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Address List */}
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div key={address.id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
                address.isDefault ? 'border-green-500' : 'border-gray-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAddressBadgeColor(address.type)}`}>
                        {getAddressIcon(address.type)}
                        <span className="ml-1 capitalize">{address.type}</span>
                      </span>
                      {address.isDefault && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-800 font-medium">{address.name}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600 mt-2">{address.address}</p>
                    {address.landmark && (
                      <p className="text-gray-500 text-sm mt-1">Landmark: {address.landmark}</p>
                    )}
                    <p className="text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-3">
                    <button
                      onClick={() => startEdit(address)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAddress(address.id)}
                      disabled={deleting === address.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                      {deleting === address.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <TrashIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  {!address.isDefault ? (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      className="text-blinkit-blue font-medium hover:text-blinkit-dark transition-colors"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-green-600 font-medium">Default Address</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            !showAddForm && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved yet</h3>
                <p className="text-gray-500 mb-6">Add your first address to get started with deliveries</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blinkit-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blinkit-dark transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-1 inline" />
                  Add New Address
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around items-center p-3 border-t border-gray-200">
        <button className="text-gray-400 flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="text-gray-400 flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs mt-1">Search</span>
        </button>
        <button className="text-gray-400 flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs mt-1">Cart</span>
        </button>
        <button className="text-blinkit-blue flex flex-col items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default AddressPage;