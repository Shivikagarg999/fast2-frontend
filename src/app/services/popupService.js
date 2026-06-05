// Popup service for handling popup-related API calls

const API_BASE_URL = '/proxy/api/popups';

class PopupService {
  // Get active popup
  static async getActivePopup() {
    try {
      const response = await fetch(`${API_BASE_URL}/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching active popup:', error);
      throw error;
    }
  }

  // Admin methods (require authentication)
  static async createPopup(popupData, adminToken) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(popupData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating popup:', error);
      throw error;
    }
  }

  static async getAllPopups(params = {}, adminToken) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching popups:', error);
      throw error;
    }
  }

  static async updatePopup(popupId, popupData, adminToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/${popupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify(popupData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating popup:', error);
      throw error;
    }
  }

  static async deletePopup(popupId, adminToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/${popupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting popup:', error);
      throw error;
    }
  }

  static async togglePopup(popupId, adminToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/${popupId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error toggling popup:', error);
      throw error;
    }
  }

  // Utility method to format popup data for API
  static formatPopupData(data) {
    return {
      title: data.title?.trim(),
      message: data.message?.trim(),
      imageUrl: data.imageUrl || null,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      type: data.type || 'info',
      position: data.position || 'top-center',
      showCloseButton: data.showCloseButton !== undefined ? data.showCloseButton : true,
      autoCloseAfter: data.autoCloseAfter || null,
      targetPages: Array.isArray(data.targetPages) ? data.targetPages : [],
      targetUsers: Array.isArray(data.targetUsers) ? data.targetUsers : [],
      priority: data.priority || 1,
    };
  }

  // Utility method to validate popup data
  static validatePopupData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.push('Message is required');
    }

    if (data.title && data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    if (data.message && data.message.length > 500) {
      errors.push('Message must be less than 500 characters');
    }

    if (!data.startTime) {
      errors.push('Start time is required');
    }

    if (!data.endTime) {
      errors.push('End time is required');
    }

    if (data.startTime && data.endTime && new Date(data.endTime) <= new Date(data.startTime)) {
      errors.push('End time must be after start time');
    }

    if (data.autoCloseAfter && (data.autoCloseAfter < 1 || data.autoCloseAfter > 300)) {
      errors.push('Auto-close time must be between 1 and 300 seconds');
    }

    if (data.priority && (data.priority < 1 || data.priority > 10)) {
      errors.push('Priority must be between 1 and 10');
    }

    return errors;
  }
}

export default PopupService;
