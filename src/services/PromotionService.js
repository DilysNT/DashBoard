const API_BASE_URL = "http://localhost:5000/api";

class PromotionService {
  // Get all promotions
  static async getPromotions() {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw error;
    }
  }

  // Get promotion by ID
  static async getPromotionById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching promotion:", error);
      throw error;
    }
  }

  // Create new promotion
  static async createPromotion(promotionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  }

  // Update promotion
  static async updatePromotion(id, promotionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  }

  // Delete promotion
  static async deletePromotion(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return true;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  }

  // Validate promotion code for booking
  static async validatePromotion(code, orderAmount) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/validate-promotion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          order_amount: orderAmount
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error validating promotion:", error);
      throw error;
    }
  }

  // Get promotion usage statistics
  static async getPromotionStats(promotionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching promotion stats:", error);
      throw error;
    }
  }

  // Get all promotion usage history
  static async getPromotionHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching promotion history:", error);
      throw error;
    }
  }

  // Toggle promotion active status
  static async togglePromotionStatus(id, isActive) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      throw error;
    }
  }

  // Bulk operations
  static async bulkDeletePromotions(ids) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/bulk-delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error bulk deleting promotions:", error);
      throw error;
    }
  }

  static async bulkTogglePromotions(ids, isActive) {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/bulk-toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, is_active: isActive }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return await response.json();
    } catch (error) {
      console.error("Error bulk toggling promotions:", error);
      throw error;
    }
  }

  // Export promotions data
  static async exportPromotions(format = 'json') {
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/export?format=${format}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (format === 'csv') {
        return await response.blob();
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error exporting promotions:", error);
      throw error;
    }
  }
}

export default PromotionService; 