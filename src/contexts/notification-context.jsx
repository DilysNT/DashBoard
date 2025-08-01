import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notificationService } from '../services/NotificationService';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  isConnected: false
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_ERROR: 'SET_ERROR',
  SET_CONNECTED: 'SET_CONNECTED'
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.is_read).length,
        loading: false,
        error: null
      };

    case ActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.is_read).length
      };

    case ActionTypes.MARK_AS_READ:
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, is_read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.is_read).length
      };

    case ActionTypes.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map(n => ({ ...n, is_read: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.is_read).length
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ActionTypes.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload
      };

    default:
      return state;
  }
}

// Context
const NotificationContext = createContext();

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Subscribe to notifications based on user role
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!user.id || !token) {
      console.log('🔕 No user or token found, skipping notification subscription');
      return;
    }

    // Determine recipient type and ID
    let recipientId, recipientType;
    
    if (user.role === 'admin') {
      recipientId = 'admin';
      recipientType = 'admin';
    } else if (user.role === 'agency' || user.agency_id) {
      recipientId = user.agency_id || user.id;
      recipientType = 'agency';
    } else {
      recipientId = user.id;
      recipientType = 'user';
    }

    console.log(`🔔 Setting up notifications for ${recipientType}: ${recipientId}`);
    
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.SET_CONNECTED, payload: true });

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      recipientId,
      recipientType,
      (notifications, error) => {
        if (error) {
          console.error('❌ Notification subscription error:', error);
          dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
          dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
        } else {
          console.log(`📬 Received ${notifications.length} notifications`);
          dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: notifications });
          dispatch({ type: ActionTypes.SET_CONNECTED, payload: true });
        }
      }
    );

    // Cleanup function
    return () => {
      console.log('🔕 Cleaning up notification subscription');
      unsubscribe();
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
    };
  }, []);

  // Action creators
  const actions = {
    markAsRead: async (notificationId) => {
      try {
        await notificationService.markAsRead(notificationId);
        dispatch({ type: ActionTypes.MARK_AS_READ, payload: notificationId });
      } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    markAllAsRead: async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        let recipientId, recipientType;
        
        if (user.role === 'admin') {
          recipientId = 'admin';
          recipientType = 'admin';
        } else if (user.role === 'agency' || user.agency_id) {
          recipientId = user.agency_id || user.id;
          recipientType = 'agency';
        } else {
          recipientId = user.id;
          recipientType = 'user';
        }

        await notificationService.markAllAsRead(recipientId, recipientType);
        dispatch({ type: ActionTypes.MARK_ALL_AS_READ });
      } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    deleteNotification: async (notificationId) => {
      try {
        await notificationService.deleteNotification(notificationId);
        dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notificationId });
      } catch (error) {
        console.error('❌ Error deleting notification:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    createNotification: async (notificationData) => {
      try {
        const notificationId = await notificationService.createNotification(notificationData);
        console.log('✅ Notification created:', notificationId);
      } catch (error) {
        console.error('❌ Error creating notification:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export { notificationService };
