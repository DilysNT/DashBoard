import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  limit,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

class NotificationService {
  /**
   * Notify admin when agency updates a tour
   * @param {Object} tourData - {id, name, agency_name}
   */
  static async notifyTourUpdatedByAgency(tourData) {
    const notificationService = new NotificationService();
    return notificationService.createNotification({
      type: NotificationService.NotificationTypes.TOUR_UPDATED,
      title: 'Tour đã được cập nhật',
      message: `Agency "${tourData.agency_name || 'Agency'}" vừa cập nhật tour "${tourData.name}"`,
      recipient_id: 'admin',
      recipient_type: 'admin',
      data: { tour_id: tourData.id },
      priority: 'normal'
    });
  }
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Create a new notification
   * @param {Object} notification 
   * @param {string} notification.type - Type of notification (tour_approved, booking_created, etc.)
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.recipient_id - User/Agency ID to receive notification
   * @param {string} notification.recipient_type - 'admin' | 'agency' | 'user'
   * @param {Object} notification.data - Additional data (tour_id, booking_id, etc.)
   * @param {string} notification.priority - 'low' | 'normal' | 'high' | 'urgent'
   */
  async createNotification(notification) {
    try {
      console.log('🔔 Creating notification:', notification);
      
      const notificationData = {
        ...notification,
        is_read: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('✅ Notification created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a recipient (one-time fetch)
   * @param {string} recipientId 
   * @param {string} recipientType 
   * @returns {Promise<Array>}
   */
  static async getNotifications(recipientId, recipientType = 'agency') {
    try {
      console.log(`📬 Fetching notifications for ${recipientType}: ${recipientId}`);
      
      const q = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', recipientId),
        where('recipient_type', '==', recipientType),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const notifications = [];
      
      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate(),
          updated_at: doc.data().updated_at?.toDate()
        });
      });

      console.log(`✅ Fetched ${notifications.length} notifications`);
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Listen to notifications for a specific user/agency
   * @param {string} recipientId - User/Agency ID
   * @param {string} recipientType - 'admin' | 'agency' | 'user'
   * @param {Function} callback - Callback function to handle notifications
   * @returns {Function} Unsubscribe function
   */
  subscribeToNotifications(recipientId, recipientType, callback) {
    try {
      console.log(`🔄 Subscribing to notifications for ${recipientType}: ${recipientId}`);

      const q = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', recipientId),
        where('recipient_type', '==', recipientType),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications = [];
        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate(),
            updated_at: doc.data().updated_at?.toDate()
          });
        });

        console.log(`📬 Received ${notifications.length} notifications for ${recipientType}: ${recipientId}`);
        callback(notifications);
      }, (error) => {
        console.error('❌ Error listening to notifications:', error);
        callback([], error);
      });

      // Store the unsubscribe function
      const listenerId = `${recipientType}_${recipientId}`;
      this.listeners.set(listenerId, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId 
   */
  async markAsRead(notificationId) {
    try {
      console.log('👁️ Marking notification as read:', notificationId);
      
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        is_read: true,
        updated_at: serverTimestamp()
      });

      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} recipientId 
   * @param {string} recipientType 
   */
  async markAllAsRead(recipientId, recipientType) {
    try {
      console.log(`📖 Marking all notifications as read for ${recipientType}: ${recipientId}`);
      
      const q = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', recipientId),
        where('recipient_type', '==', recipientType),
        where('is_read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          is_read: true,
          updated_at: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`✅ Marked ${querySnapshot.size} notifications as read`);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId 
   */
  async deleteNotification(notificationId) {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      
      await deleteDoc(doc(db, 'notifications', notificationId));
      console.log('✅ Notification deleted:', notificationId);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from notifications
   * @param {string} recipientId 
   * @param {string} recipientType 
   */
  unsubscribeFromNotifications(recipientId, recipientType) {
    const listenerId = `${recipientType}_${recipientId}`;
    const unsubscribe = this.listeners.get(listenerId);
    
    if (unsubscribe) {
      console.log(`🔕 Unsubscribing from notifications for ${recipientType}: ${recipientId}`);
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Unsubscribe from all notifications
   */
  unsubscribeAll() {
    console.log('🔕 Unsubscribing from all notifications');
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  /**
   * Predefined notification types for different events
   */
  static NotificationTypes = {
    // Tour related
    TOUR_CREATED: 'tour_created',
    TOUR_APPROVED: 'tour_approved',
    TOUR_REJECTED: 'tour_rejected',
    TOUR_UPDATED: 'tour_updated',
    
    // Booking related
    BOOKING_CREATED: 'booking_created',
    BOOKING_CONFIRMED: 'booking_confirmed',
    BOOKING_CANCELLED: 'booking_cancelled',
    BOOKING_PAYMENT_RECEIVED: 'booking_payment_received',
    
    // Review related
    REVIEW_CREATED: 'review_created',
    REVIEW_APPROVED: 'review_approved',
    REVIEW_REJECTED: 'review_rejected',
    
    // Agency related
    AGENCY_REGISTERED: 'agency_registered',
    AGENCY_APPROVED: 'agency_approved',
    AGENCY_REJECTED: 'agency_rejected',
    
    // System
    SYSTEM_MAINTENANCE: 'system_maintenance',
    SYSTEM_UPDATE: 'system_update'
  };

  /**
   * Helper methods for common notification scenarios
   */
  
  // Notify admin when agency creates new tour
  async notifyAdminTourCreated(tourId, tourName, agencyName) {
    return this.createNotification({
      type: NotificationService.NotificationTypes.TOUR_CREATED,
      title: 'Tour mới cần phê duyệt',
      message: `Agency "${agencyName}" đã tạo tour "${tourName}" cần được phê duyệt`,
      recipient_id: 'admin',
      recipient_type: 'admin',
      data: { tour_id: tourId },
      priority: 'normal'
    });
  }

  // Notify agency when tour is approved/rejected
  async notifyAgencyTourStatus(agencyId, tourId, tourName, isApproved) {
    return this.createNotification({
      type: isApproved ? NotificationService.NotificationTypes.TOUR_APPROVED : NotificationService.NotificationTypes.TOUR_REJECTED,
      title: isApproved ? 'Tour đã được phê duyệt' : 'Tour bị từ chối',
      message: `Tour "${tourName}" ${isApproved ? 'đã được phê duyệt' : 'bị từ chối'}`,
      recipient_id: agencyId,
      recipient_type: 'agency',
      data: { tour_id: tourId },
      priority: isApproved ? 'normal' : 'high'
    });
  }

  // Notify agency when new booking is created
  async notifyAgencyNewBooking(agencyId, bookingId, tourName, customerName) {
    return this.createNotification({
      type: NotificationService.NotificationTypes.BOOKING_CREATED,
      title: 'Đặt tour mới',
      message: `Khách hàng "${customerName}" đã đặt tour "${tourName}"`,
      recipient_id: agencyId,
      recipient_type: 'agency',
      data: { booking_id: bookingId },
      priority: 'high'
    });
  }

  // Notify agency when new review is created
  async notifyAgencyNewReview(agencyId, reviewId, tourName, rating) {
    return this.createNotification({
      type: NotificationService.NotificationTypes.REVIEW_CREATED,
      title: 'Đánh giá mới',
      message: `Tour "${tourName}" nhận được đánh giá ${rating} sao`,
      recipient_id: agencyId,
      recipient_type: 'agency',
      data: { review_id: reviewId },
      priority: 'normal'
    });
  }

  // Backward compatibility methods for existing code
  static async notifyTourSubmissionForApproval(tourData) {
    const notificationService = new NotificationService();
    return notificationService.notifyAdminTourCreated(
      tourData.id,
      tourData.name,
      tourData.agency_name || 'Agency'
    );
  }

  static async notifyBookingCreated(bookingData) {
    const notificationService = new NotificationService();
    return notificationService.notifyAgencyNewBooking(
      bookingData.agency_id,
      bookingData.id,
      bookingData.tour_name,
      bookingData.customer_name
    );
  }

  static async notifyReviewCreated(reviewData) {
    const notificationService = new NotificationService();
    return notificationService.notifyAgencyNewReview(
      reviewData.agency_id,
      reviewData.id,
      reviewData.tour_name,
      reviewData.rating
    );
  }
}

export const notificationService = new NotificationService();
export default NotificationService;
