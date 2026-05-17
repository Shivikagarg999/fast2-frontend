'use client';

import React, { useState, useEffect } from 'react';
import PopupService from '../../services/popupService';

const PopupAdmin = ({ adminToken }) => {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    startTime: '',
    endTime: '',
    isActive: true,
    type: 'info',
    position: 'top-center',
    showCloseButton: true,
    autoCloseAfter: '',
    targetPages: '',
    targetUsers: '',
    priority: 1
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    setLoading(true);
    try {
      const result = await PopupService.getAllPopups({}, adminToken);
      if (result.success) {
        setPopups(result.data);
      }
    } catch (error) {
      console.error('Error fetching popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Format target pages and users
    const popupData = {
      ...formData,
      targetPages: formData.targetPages ? formData.targetPages.split(',').map(p => p.trim()) : [],
      targetUsers: formData.targetUsers ? formData.targetUsers.split(',').map(u => u.trim()) : [],
      autoCloseAfter: formData.autoCloseAfter ? parseInt(formData.autoCloseAfter) : null
    };

    // Validate data
    const validationErrors = PopupService.validatePopupData(popupData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Format data for API
    const formattedData = PopupService.formatPopupData(popupData);

    try {
      let result;
      if (editingPopup) {
        result = await PopupService.updatePopup(editingPopup._id, formattedData, adminToken);
      } else {
        result = await PopupService.createPopup(formattedData, adminToken);
      }

      if (result.success) {
        await fetchPopups();
        resetForm();
        setShowForm(false);
        alert(editingPopup ? 'Popup updated successfully!' : 'Popup created successfully!');
      } else {
        setErrors([result.message || 'Failed to save popup']);
      }
    } catch (error) {
      console.error('Error saving popup:', error);
      setErrors(['Failed to save popup. Please try again.']);
    }
  };

  const handleEdit = (popup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      message: popup.message,
      imageUrl: popup.imageUrl || '',
      startTime: new Date(popup.startTime).toISOString().slice(0, 16),
      endTime: new Date(popup.endTime).toISOString().slice(0, 16),
      isActive: popup.isActive,
      type: popup.type,
      position: popup.position,
      showCloseButton: popup.showCloseButton,
      autoCloseAfter: popup.autoCloseAfter || '',
      targetPages: popup.targetPages ? popup.targetPages.join(', ') : '',
      targetUsers: popup.targetUsers ? popup.targetUsers.join(', ') : '',
      priority: popup.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (popupId) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;

    try {
      const result = await PopupService.deletePopup(popupId, adminToken);
      if (result.success) {
        await fetchPopups();
        alert('Popup deleted successfully!');
      } else {
        alert('Failed to delete popup');
      }
    } catch (error) {
      console.error('Error deleting popup:', error);
      alert('Failed to delete popup. Please try again.');
    }
  };

  const handleToggle = async (popupId) => {
    try {
      const result = await PopupService.togglePopup(popupId, adminToken);
      if (result.success) {
        await fetchPopups();
      } else {
        alert('Failed to toggle popup');
      }
    } catch (error) {
      console.error('Error toggling popup:', error);
      alert('Failed to toggle popup. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      imageUrl: '',
      startTime: '',
      endTime: '',
      isActive: true,
      type: 'info',
      position: 'top-center',
      showCloseButton: true,
      autoCloseAfter: '',
      targetPages: '',
      targetUsers: '',
      priority: 1
    });
    setEditingPopup(null);
    setErrors([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isPopupActive = (popup) => {
    const now = new Date();
    const start = new Date(popup.startTime);
    const end = new Date(popup.endTime);
    return popup.isActive && start <= now && end >= now;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Popup Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create New Popup
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingPopup ? 'Edit Popup' : 'Create New Popup'}
            </h2>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  maxLength={500}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto Close (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={formData.autoCloseAfter}
                    onChange={(e) => setFormData({ ...formData, autoCloseAfter: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Leave empty for manual close"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Pages (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.targetPages}
                    onChange={(e) => setFormData({ ...formData, targetPages: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="/home, /products, /about"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Users (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.targetUsers}
                    onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="premium, new, vip"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showCloseButton}
                    onChange={(e) => setFormData({ ...formData, showCloseButton: e.target.checked })}
                    className="mr-2"
                  />
                  Show Close Button
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingPopup ? 'Update Popup' : 'Create Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popups List */}
      {loading ? (
        <div className="text-center py-8">Loading popups...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {popups.map((popup) => (
                <tr key={popup._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{popup.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {popup.message}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      popup.type === 'info' ? 'bg-purple-100 text-purple-800' :
                      popup.type === 'success' ? 'bg-purple-100 text-purple-800' :
                      popup.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {popup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatDate(popup.startTime)}</div>
                    <div>to {formatDate(popup.endTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      isPopupActive(popup) ? 'bg-purple-100 text-purple-800' :
                      popup.isActive ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {isPopupActive(popup) ? 'Active' :
                       popup.isActive ? 'Scheduled' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {popup.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(popup)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(popup._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {popup.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(popup._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {popups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No popups found. Create your first popup!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PopupAdmin;
