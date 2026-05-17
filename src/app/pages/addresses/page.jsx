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
  XMarkIcon,
  CheckIcon
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
    label: 'home',
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });

  // Check authentication status
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchAddresses();
    } else {
      setLoading(false);
      setError('Please login to view your addresses');
    }
  }, []);

  // Fetch addresses from your API
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setError('Please login to view your addresses');
        setLoading(false);
        return;
      }

      const response = await fetch('https://www.fast2.in/proxy/api/user/addresses/get', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setError('Session expired. Please login again.');a
          return;
        }
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      } else {
        throw new Error(data.message || 'Failed to fetch addresses');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new address
  const createAddress = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('https://www.fast2.in/proxy/api/user/addresses/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create address');
      }

      setSuccess('Address added successfully!');
      resetForm();
      fetchAddresses(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update existing address
  const updateAddress = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(`https://www.fast2.in/proxy/api/user/addresses/update/${editingAddress._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressForm),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update address');
      }

      setSuccess('Address updated successfully!');
      resetForm();
      fetchAddresses(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      setDeleting(addressId);
      setError('');

      const response = await fetch(`https://www.fast2.in/proxy/api/user/addresses/delete/${addressId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete address');
      }

      setSuccess('Address deleted successfully!');
      fetchAddresses(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    try {
      setError('');

      const response = await fetch(`https://www.fast2.in/proxy/api/user/addresses/${addressId}/default`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to set default address');
      }

      setSuccess('Default address updated!');
      fetchAddresses(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveAddress = async () => {
    if (editingAddress) {
      await updateAddress();
    } else {
      await createAddress();
    }
  };

  const resetForm = () => {
    setAddressForm({
      label: 'home',
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const startEdit = (address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label || 'home',
      fullName: address.fullName || '',
      phoneNumber: address.phoneNumber || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India',
      isDefault: address.isDefault || false
    });
    setShowAddForm(true);
  };

  const getAddressIcon = (label, isSelected = false) => {
    const IconComponent = isSelected ? 
      (label === 'home' ? HomeSolidIcon : label === 'work' ? OfficeSolidIcon : MapPinSolidIcon) :
      (label === 'home' ? HomeIcon : label === 'work' ? BuildingOfficeIcon : MapPinIcon);
    
    const colorClass = label === 'home' ? 'text-purple-600' : 
                      label === 'work' ? 'text-purple-600' : 'text-purple-600';
    
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />;
  };

  const getAddressBadgeColor = (label) => {
    return label === 'home' ? 'bg-purple-100 text-purple-800' : 
           label === 'work' ? 'bg-purple-100 text-purple-800' : 
           'bg-purple-100 text-purple-800';
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPinIcon className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view addresses</h2>
          <p className="text-gray-600 mb-6">Manage your delivery addresses</p>
          <button 
            onClick={handleLoginRedirect}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md"
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
          <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-purple-800 font-bold text-lg">×</button>
            </div>
          </div>
        )}

        {/* Add New Address Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-white border-2 border-dashed border-purple-600 text-purple-600 rounded-xl p-6 mb-6 hover:bg-purple-50 transition-colors"
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
                    onClick={() => setAddressForm({...addressForm, label: value})}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      addressForm.label === value
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
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
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={addressForm.phoneNumber}
                onChange={(e) => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address Line 1 Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <textarea
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({...addressForm, addressLine1: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="House no., Building, Street, Area"
                rows={2}
              />
            </div>

            {/* Address Line 2 Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={addressForm.addressLine2}
                onChange={(e) => setAddressForm({...addressForm, addressLine2: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Landmark, Nearby location"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Pincode"
                />
              </div>
            </div>

            {/* Country Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={addressForm.country}
                onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Country"
              />
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="defaultAddress"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
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
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
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
              <div key={address._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
                address.isDefault ? 'border-purple-500' : 'border-gray-300'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAddressBadgeColor(address.label)}`}>
                        {getAddressIcon(address.label)}
                        <span className="ml-1 capitalize">{address.label}</span>
                      </span>
                      {address.isDefault && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                          <CheckIcon className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-800 font-medium">{address.fullName}</p>
                    <p className="text-gray-600">{address.phoneNumber}</p>
                    <p className="text-gray-600 mt-2">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-gray-500 text-sm mt-1">{address.addressLine2}</p>
                    )}
                    <p className="text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-gray-500 text-sm">{address.country}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-3">
                    <button
                      onClick={() => startEdit(address)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteAddress(address._id)}
                      disabled={deleting === address._id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                      {deleting === address._id ? (
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
                      onClick={() => setDefaultAddress(address._id)}
                      className="text-purple-600 font-medium hover:text-purple-700 transition-colors flex items-center"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-purple-600 font-medium flex items-center">
                      <CheckIcon className="w-4 h-4 mr-1" />
                      Default Address
                    </span>
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
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-1 inline" />
                  Add New Address
                </button>
              </div>
            )
          )}
        </div>
      </div>

    </div>
  );
};

export default AddressPage;