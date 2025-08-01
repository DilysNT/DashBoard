import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, LogOut, Building2, Mail, Phone, MapPin, Globe, Star, Calendar, Award } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { useNavigate } from 'react-router-dom';

const AgencyProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/agency/settings');
  };

  // Enhanced agency info with complete data
  const agencyInfo = {
    name: user?.agency_name || user?.name || 'Đại lý du lịch',
    email: user?.agency_email || user?.email || 'contact@agency.com',
    phone: user?.agency_phone || user?.phone || '0123456789',
    address: user?.agency_address || user?.address || 'Chưa cập nhật địa chỉ',
    avatar: user?.agency_avatar || user?.avatar || null,
    description: user?.agency_description || 'Đại lý du lịch chuyên nghiệp',
    website: user?.agency_website || null,
    license_number: user?.license_number || 'Chưa cập nhật',
    established_date: user?.established_date || null,
    rating: user?.rating || 0,
    total_tours: user?.total_tours || 0
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full">
          {agencyInfo.avatar ? (
            <img 
              src={agencyInfo.avatar} 
              alt="Agency Avatar" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <Building2 size={16} />
          )}
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {agencyInfo.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Agency
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
          {/* Agency Info Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full">
                {agencyInfo.avatar ? (
                  <img 
                    src={agencyInfo.avatar} 
                    alt="Agency Avatar" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <Building2 size={20} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {agencyInfo.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Đại lý du lịch
                  </span>
                  {agencyInfo.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {agencyInfo.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {agencyInfo.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                {agencyInfo.description}
              </p>
            )}
          </div>

          {/* Agency Details */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">
                {agencyInfo.email}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">
                {agencyInfo.phone}
              </span>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-slate-400 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-300">
                {agencyInfo.address}
              </span>
            </div>

            {agencyInfo.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe size={16} className="text-slate-400" />
                <a 
                  href={agencyInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {agencyInfo.website}
                </a>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Award size={16} className="text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">
                Giấy phép: {agencyInfo.license_number}
              </span>
            </div>

            {agencyInfo.established_date && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  Thành lập: {new Date(agencyInfo.established_date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}

            {agencyInfo.total_tours > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 size={16} className="text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  Tổng tour: {agencyInfo.total_tours}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings size={16} />
              Cài đặt tài khoản
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-700"
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyProfile;
