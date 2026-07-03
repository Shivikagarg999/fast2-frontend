// Policy service for handling policy-related API calls

const API_BASE_URL = '/proxy/api/policy';

class PolicyService {
  // Get a single active policy by type (terms | return | cancellation | refund)
  static async getActivePolicyByType(policyType) {
    try {
      const response = await fetch(`${API_BASE_URL}/active/${policyType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error fetching active ${policyType} policy:`, error);
      throw error;
    }
  }

  // Get all active policies at once, keyed by policyType
  static async getAllActivePolicies() {
    try {
      const response = await fetch(`${API_BASE_URL}/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching active policies:', error);
      throw error;
    }
  }
}

export default PolicyService;
