'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PencilIcon, 
  CameraIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  DevicePhoneMobileIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  StarIcon,
  GiftIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/footer/page';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check authentication status and get token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Check auth status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = getToken();
      setIsLoggedIn(!!token);
      if (!token) {
        setLoading(false);
        setError('Please login to view your profile');
      }
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authChange', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', checkAuthStatus);
    };
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        setError('Please login to view your profile');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.fast2.in/api/user/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          window.dispatchEvent(new Event('authChange'));
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        address: data.user.address || []
      });
      
      if (data.user.avatar) {
        setAvatarPreview(data.user.avatar);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: []
  });

  // Update profile
  const updateProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = getToken();
      const response = await fetch('https://api.fast2.in/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          window.dispatchEvent(new Event('authChange'));
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar
  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    try {
      setSaving(true);
      const token = getToken();
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await fetch('https://api.fast2.in/api/user/profile/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          window.dispatchEvent(new Event('authChange'));
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setUser(data.user);
      setAvatarPreview(data.user.avatar);
      setSuccess('Profile picture updated successfully!');
      setAvatarFile(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error uploading avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('https://api.fast2.in/api/user/profile/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          window.dispatchEvent(new Event('authChange'));
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error('Failed to delete account');
      }

      localStorage.removeItem('token');
      setIsLoggedIn(false);
      window.dispatchEvent(new Event('authChange'));
      router.push('/');
    } catch (err) {
      setError(err.message);
      console.error('Error deleting account:', err);
    }
  };

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add new address
  const addAddress = () => {
    if (newAddress.trim()) {
      setFormData({
        ...formData,
        address: [...formData.address, newAddress.trim()]
      });
      setNewAddress('');
    }
  };

  // Remove address
  const removeAddress = (index) => {
    const updatedAddresses = [...formData.address];
    updatedAddresses.splice(index, 1);
    setFormData({
      ...formData,
      address: updatedAddresses
    });
  };

  // Fetch profile when authenticated
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  if (loading) {
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
            <UserIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h2>
          <p className="text-gray-600 mb-6">Access your orders, addresses, and account settings</p>
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
      {/* Header with Blinkit-style gradient background */}
      <div className="bg-gradient-to-r from-blinkit-orange to-blinkit-blue text-black pb-24 pt-6">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold ml-4">My Profile</h1>
            <div className="ml-auto">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center text-black font-medium bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <PencilIcon className="w-4 h-4 mr-1"   />
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* User Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-gray-800">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-md">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blinkit-blue p-2 rounded-full text-white cursor-pointer shadow-md hover:bg-blinkit-dark transition-colors">
                  <CameraIcon className="w-4 h-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-600">{user?.phone}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>

            {avatarFile && (
              <button
                onClick={uploadAvatar}
                disabled={saving}
                className="w-full bg-blinkit-blue text-white py-2 rounded-lg text-sm font-medium hover:bg-blinkit-dark disabled:opacity-50 transition-colors"
              >
                {saving ? 'Uploading...' : 'Save Profile Picture'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="text-red-800 font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 shadow-sm">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button 
                onClick={() => setSuccess('')}
                className="text-blue-800 font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
                Email Address
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DevicePhoneMobileIcon className="w-4 h-4 mr-2 text-gray-500" />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blinkit-blue focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Button (when editing) */}
        {editing && (
          <div className="sticky bottom-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <button
              onClick={updateProfile}
              disabled={saving}
              className="w-full bg-blinkit-blue text-black py-4 rounded-xl font-bold hover:bg-blinkit-dark disabled:opacity-50 transition-colors shadow-md"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
};

export default ProfilePage;