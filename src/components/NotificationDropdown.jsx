import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Eye, Clock, CheckCircle, XCircle, Edit } from 'lucide-react';
import NotificationService from '../services/NotificationService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const userRole = localStorage.getItem('role');

  // Fetch notifications từ API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getNotifications();
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Fallback data dựa trên role của user
      const userRole = localStorage.getItem('role');
      console.log('🔍 DEBUG - Current user role:', userRole);
      
      if (userRole === 'admin') {
        // Admin nhận thông báo tour cần duyệt từ agency
        console.log('📋 Loading admin notifications...');
        setNotifications([
          {
            id: 1,
            type: 'tour_approval_request',
            title: 'Tour mới cần duyệt',
            message: 'Tour "Khám phá Phú Quốc 3N2Đ" từ Travel Agency cần được duyệt',
            is_read: false,
            created_at: new Date().toISOString(),
            tour_id: 1,
            agency_name: 'Travel Agency'
          },
          {
            id: 2,
            type: 'tour_approval_request',
            title: 'Tour mới cần duyệt',
            message: 'Tour "Hành trình Sapa" từ VietTravel cần được duyệt',
            is_read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            tour_id: 2,
            agency_name: 'VietTravel'
          }
        ]);
        setUnreadCount(2);
      } else {
        // Agency nhận thông báo kết quả duyệt từ admin
        console.log('🏢 Loading agency notifications...');
        setNotifications([
          {
            id: 1,
            type: 'tour_approved',
            title: 'Tour đã được duyệt',
            message: 'Tour "Hành trình Sapa" của bạn đã được admin phê duyệt',
            is_read: false,
            created_at: new Date().toISOString(),
            tour_id: 2
          },
          {
            id: 2,
            type: 'tour_updated',
            title: 'Tour đã được cập nhật',
            message: 'Admin đã cập nhật thông tin tour "Khám phá Đà Lạt"',
            is_read: false,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            tour_id: 3
          },
          {
            id: 3,
            type: 'tour_rejected',
            title: 'Tour bị từ chối',
            message: 'Tour "Phú Quốc 5N4Đ" không được duyệt. Lý do: Thiếu thông tin chi tiết',
            is_read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            tour_id: 4
          }
        ]);
        setUnreadCount(2);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback: update locally
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback: update locally
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'tour_approval_request':
        return <Clock size={16} className="text-yellow-600" />;
      case 'tour_approved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'tour_rejected':
        return <XCircle size={16} className="text-red-600" />;
      case 'tour_updated':
        return <Edit size={16} className="text-blue-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm ${
                        !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                      } mt-1`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
