// adminDashboard.service.js
const API_BASE_URL = 'http://localhost:5191/api';

export const adminDashboardService = {
  getDashboardSummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Dashboard/summary`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary');
      }
      return await response.json();
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
  },

  getLiveIncidents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/EmergencyIncidents`);
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      return await response.json();
    } catch (error) {
      console.error("Incidents Service Error:", error);
      throw error;
    }
  }
};