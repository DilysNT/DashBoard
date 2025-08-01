import React, { useState, useEffect } from "react";
import { Shield, FileText, Settings, User, Save, Building2, Mail, Phone, MapPin, Globe, Award, Calendar, Upload, TestTube } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";
import AgencyService from "../../../services/AgencyService";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import NotificationTester from "../../../components/NotificationTester";

export default function SettingsPage() {
    const { user, login } = useAuth();
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Agency profile state
    const [agencyProfile, setAgencyProfile] = useState({
        name: user?.agency_name || user?.name || "",
        email: user?.agency_email || user?.email || "",
        phone: user?.agency_phone || user?.phone || "",
        address: user?.agency_address || user?.address || "",
        description: user?.agency_description || "",
        website: user?.agency_website || "",
        license_number: user?.license_number || "",
        established_date: user?.established_date || "",
        avatar: user?.agency_avatar || user?.avatar || ""
    });

    // Load agency profile on component mount
    useEffect(() => {
        loadAgencyProfile();
    }, []);

    const loadAgencyProfile = async () => {
        try {
            const profile = await AgencyService.getCurrentAgencyProfile();
            setAgencyProfile(prev => ({
                ...prev,
                ...profile
            }));
        } catch (error) {
            console.error('Error loading agency profile:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setAgencyProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const cloudinaryResult = await uploadToCloudinary(file);
            const avatarData = {
                avatar: cloudinaryResult.url,
                avatar_public_id: cloudinaryResult.public_id
            };
            
            await AgencyService.updateAgencyAvatar(avatarData);
            
            // Update local state
            setAgencyProfile(prev => ({
                ...prev,
                avatar: cloudinaryResult.url
            }));

            // Update user context
            const updatedUser = {
                ...user,
                agency_avatar: cloudinaryResult.url,
                avatar: cloudinaryResult.url
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            alert('Cập nhật avatar thành công!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Có lỗi khi upload avatar. Vui lòng thử lại!');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedProfile = await AgencyService.updateAgencyProfile(agencyProfile);
            
            // Update user context with new profile data
            const updatedUser = {
                ...user,
                ...updatedProfile,
                agency_name: updatedProfile.name || agencyProfile.name,
                agency_email: updatedProfile.email || agencyProfile.email,
                agency_phone: updatedProfile.phone || agencyProfile.phone,
                agency_address: updatedProfile.address || agencyProfile.address,
                agency_description: updatedProfile.description || agencyProfile.description,
                agency_website: updatedProfile.website || agencyProfile.website,
                license_number: updatedProfile.license_number || agencyProfile.license_number,
                established_date: updatedProfile.established_date || agencyProfile.established_date
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            alert("Cập nhật thông tin thành công!");
        } catch (error) {
            console.error('Error updating profile:', error);
            alert("Có lỗi khi cập nhật thông tin. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Cài đặt hệ thống</h1>
                <p className="text-slate-600 mt-1">Quản lý thông tin đại lý và các chính sách</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab("general")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "general"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <User className="inline-block w-4 h-4 mr-2" />
                        Thông tin đại lý
                    </button>
                    <button
                        onClick={() => setActiveTab("terms")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "terms"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <FileText className="inline-block w-4 h-4 mr-2" />
                        Điều khoản sử dụng
                    </button>
                    <button
                        onClick={() => setActiveTab("privacy")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "privacy"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <Shield className="inline-block w-4 h-4 mr-2" />
                        Chính sách bảo mật
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "notifications"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                    >
                        <TestTube className="inline-block w-4 h-4 mr-2" />
                        Test Notifications
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "general" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-6">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Thông tin đại lý</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {agencyProfile.avatar ? (
                                    <img 
                                        src={agencyProfile.avatar} 
                                        alt="Agency Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 size={32} className="text-gray-400" />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo đại lý
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    id="avatar-upload"
                                    disabled={uploading}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Upload size={16} className="mr-2" />
                                    {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                                </label>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Building2 size={16} className="inline mr-1" />
                                    Tên đại lý
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={agencyProfile.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail size={16} className="inline mr-1" />
                                    Email liên hệ
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={agencyProfile.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone size={16} className="inline mr-1" />
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={agencyProfile.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Globe size={16} className="inline mr-1" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={agencyProfile.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    placeholder="https://website.com"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Award size={16} className="inline mr-1" />
                                    Số giấy phép kinh doanh
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={agencyProfile.license_number}
                                    onChange={(e) => handleInputChange('license_number', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={16} className="inline mr-1" />
                                    Ngày thành lập
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={agencyProfile.established_date ? agencyProfile.established_date.split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('established_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Address and Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} className="inline mr-1" />
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={agencyProfile.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả về đại lý
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={agencyProfile.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Mô tả về dịch vụ và kinh nghiệm của đại lý..."
                            />
                        </div>
                        
                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === "terms" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Điều khoản sử dụng</h2>
                    </div>
                    <div className="prose max-w-none text-gray-700 space-y-4">
                        <p className="text-sm text-gray-500 mb-6">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                        
                        <h3 className="text-lg font-semibold text-gray-900">1. Chấp nhận điều khoản</h3>
                        <p>Bằng việc sử dụng hệ thống quản lý tour du lịch này, đại lý đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng dưới đây.</p>

                        <h3 className="text-lg font-semibold text-gray-900">2. Quyền và trách nhiệm của đại lý</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Đại lý có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ cho bên thứ ba</li>
                            <li>Cung cấp thông tin tour chính xác, đầy đủ và cập nhật thường xuyên</li>
                            <li>Tuân thủ các quy định về kinh doanh tour du lịch theo pháp luật Việt Nam</li>
                            <li>Đảm bảo chất lượng dịch vụ tour theo cam kết với khách hàng</li>
                            <li>Bảo vệ thông tin cá nhân của khách hàng theo quy định</li>
                            <li>Thanh toán đầy đủ các khoản phí dịch vụ theo thỏa thuận</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">3. Quyền lợi của đại lý</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Sử dụng đầy đủ các tính năng của hệ thống quản lý tour</li>
                            <li>Nhận hỗ trợ kỹ thuật và tư vấn từ đội ngũ chuyên viên</li>
                            <li>Được bảo mật thông tin kinh doanh và dữ liệu khách hàng</li>
                            <li>Nhận thông báo về các cập nhật và tính năng mới</li>
                            <li>Được đào tạo sử dụng hệ thống hiệu quả</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">4. Quy định về nội dung</h3>
                        <p>Đại lý cam kết:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Không đăng tải nội dung vi phạm pháp luật hoặc đạo đức xã hội</li>
                            <li>Không sử dụng hình ảnh, video có bản quyền mà chưa được phép</li>
                            <li>Mô tả tour trung thực, không thổi phồng hoặc gây hiểu lầm</li>
                            <li>Cập nhật thông tin khi có thay đổi về lịch trình hoặc giá cả</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">5. Chấm dứt hợp tác</h3>
                        <p>Chúng tôi có quyền chấm dứt hợp tác với đại lý trong các trường hợp:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Vi phạm nghiêm trọng các điều khoản sử dụng</li>
                            <li>Cung cấp thông tin sai lệch hoặc lừa đảo khách hàng</li>
                            <li>Không thanh toán các khoản phí dịch vụ đúng hạn</li>
                            <li>Sử dụng hệ thống cho mục đích bất hợp pháp</li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === "privacy" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <Shield className="w-5 h-5 mr-2 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Chính sách bảo mật</h2>
                    </div>
                    <div className="prose max-w-none text-gray-700 space-y-4">
                        <p className="text-sm text-gray-500 mb-6">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                        
                        <h3 className="text-lg font-semibold text-gray-900">1. Cam kết bảo mật</h3>
                        <p>Chúng tôi cam kết bảo vệ thông tin của đại lý và khách hàng theo các tiêu chuẩn bảo mật cao nhất. Tất cả dữ liệu được xử lý một cách an toàn và minh bạch.</p>

                        <h3 className="text-lg font-semibold text-gray-900">2. Thông tin chúng tôi thu thập</h3>
                        <h4 className="font-medium text-gray-900">Thông tin đại lý:</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Thông tin đăng ký: tên đại lý, địa chỉ, email, số điện thoại</li>
                            <li>Thông tin tài khoản: tên đăng nhập, mật khẩu đã mã hóa</li>
                            <li>Thông tin kinh doanh: giấy phép kinh doanh, mã số thuế</li>
                            <li>Thông tin sử dụng: lịch sử hoạt động, thống kê tour</li>
                        </ul>
                        
                        <h4 className="font-medium text-gray-900 mt-4">Thông tin khách hàng:</h4>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>Thông tin đặt tour: họ tên, CMND/CCCD, số điện thoại</li>
                            <li>Thông tin thanh toán: phương thức thanh toán, trạng thái giao dịch</li>
                            <li>Lịch sử đánh giá và phản hồi về dịch vụ</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">3. Mục đích sử dụng thông tin</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Cung cấp dịch vụ quản lý tour và hỗ trợ đại lý</li>
                            <li>Xử lý đặt tour và thanh toán của khách hàng</li>
                            <li>Liên lạc về các vấn đề kỹ thuật và cập nhật hệ thống</li>
                            <li>Tạo báo cáo thống kê và phân tích kinh doanh</li>
                            <li>Tuân thủ các yêu cầu pháp lý và quy định ngành du lịch</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">4. Bảo vệ dữ liệu</h3>
                        <p>Chúng tôi áp dụng các biện pháp bảo mật tiên tiến:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Mã hóa SSL/TLS cho tất cả các giao dịch và truyền tải dữ liệu</li>
                            <li>Hệ thống tường lửa và phát hiện xâm nhập 24/7</li>
                            <li>Sao lưu dữ liệu định kỳ với nhiều lớp bảo mật</li>
                            <li>Kiểm tra bảo mật thường xuyên bởi bên thứ ba độc lập</li>
                            <li>Phân quyền truy cập nghiêm ngặt cho nhân viên</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">5. Chia sẻ thông tin với bên thứ ba</h3>
                        <p>Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Có sự đồng ý rõ ràng từ đại lý</li>
                            <li>Yêu cầu của cơ quan pháp luật có thẩm quyền</li>
                            <li>Với đối tác thanh toán để xử lý giao dịch</li>
                            <li>Với nhà cung cấp dịch vụ kỹ thuật đã ký thỏa thuận bảo mật</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">6. Quyền của đại lý và khách hàng</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Quyền truy cập và kiểm tra thông tin cá nhân</li>
                            <li>Quyền yêu cầu chỉnh sửa thông tin không chính xác</li>
                            <li>Quyền yêu cầu xóa dữ liệu (theo quy định pháp luật)</li>
                            <li>Quyền khiếu nại về việc xử lý dữ liệu</li>
                            <li>Quyền rút lại sự đồng ý xử lý dữ liệu</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">7. Liên hệ về bảo mật</h3>
                        <p>Để được hỗ trợ về các vấn đề bảo mật, vui lòng liên hệ:</p>
                        <div className="bg-gray-50 p-4 rounded-md mt-2">
                            <p><strong>Hotline bảo mật:</strong> (84) 123 456 789</p>
                            <p><strong>Email:</strong> security@tourmanagement.vn</p>
                            <p><strong>Thời gian hỗ trợ:</strong> 24/7 cho các vấn đề bảo mật khẩn cấp</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Testing Tab */}
            {activeTab === "notifications" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-6">
                        <TestTube className="w-5 h-5 mr-2 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Firebase Notification Testing</h2>
                    </div>
                    
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            <strong>⚠️ Development Tool:</strong> Tab này chỉ để test Firebase notifications trong môi trường development.
                        </p>
                    </div>
                    
                    <NotificationTester />
                </div>
            )}
        </div>
    );
}
