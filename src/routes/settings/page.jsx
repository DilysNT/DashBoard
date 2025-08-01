import React, { useState } from "react";
import { Shield, FileText, Settings, User, Save } from "lucide-react";

export default function SettingsPage() {
    const [agencyName, setAgencyName] = useState("Đại lý du lịch ABC");
    const [email, setEmail] = useState("contact@abc.vn");
    const [phone, setPhone] = useState("0123456789");
    const [activeTab, setActiveTab] = useState("general");

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Cập nhật thông tin thành công!");
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Cài đặt hệ thống</h1>
                <p className="text-slate-600 mt-1">Quản lý thông tin hệ thống và các chính sách</p>
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
                        <Settings className="inline-block w-4 h-4 mr-2" />
                        Cài đặt chung
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
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "general" && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên đại lý</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email liên hệ</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Lưu thay đổi
                        </button>
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
                        <p>Bằng việc sử dụng hệ thống quản lý tour du lịch này, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng dưới đây.</p>

                        <h3 className="text-lg font-semibold text-gray-900">2. Quyền và trách nhiệm của người dùng</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Người dùng có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ cho bên thứ ba</li>
                            <li>Nghiêm cấm sử dụng hệ thống để thực hiện các hoạt động bất hợp pháp</li>
                            <li>Người dùng phải cung cấp thông tin chính xác và cập nhật thường xuyên</li>
                            <li>Tuân thủ các quy định về bảo vệ dữ liệu và quyền riêng tư của khách hàng</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">3. Quyền sở hữu trí tuệ</h3>
                        <p>Tất cả nội dung, thiết kế, và chức năng của hệ thống thuộc quyền sở hữu của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.</p>

                        <h3 className="text-lg font-semibold text-gray-900">4. Giới hạn trách nhiệm</h3>
                        <p>Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng hệ thống, bao gồm nhưng không giới hạn ở mất mát dữ liệu hoặc gián đoạn dịch vụ.</p>

                        <h3 className="text-lg font-semibold text-gray-900">5. Chấm dứt sử dụng</h3>
                        <p>Chúng tôi có quyền chấm dứt hoặc tạm ngưng quyền truy cập của bạn vào hệ thống nếu vi phạm các điều khoản này.</p>

                        <h3 className="text-lg font-semibold text-gray-900">6. Thay đổi điều khoản</h3>
                        <p>Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng hệ thống sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>
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
                        
                        <h3 className="text-lg font-semibold text-gray-900">1. Thu thập thông tin</h3>
                        <p>Chúng tôi thu thập các loại thông tin sau:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Thông tin cá nhân: họ tên, email, số điện thoại, địa chỉ</li>
                            <li>Thông tin đăng nhập: tên người dùng, mật khẩu đã mã hóa</li>
                            <li>Thông tin sử dụng: lịch sử truy cập, hoạt động trên hệ thống</li>
                            <li>Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, hệ điều hành</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">2. Mục đích sử dụng thông tin</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Cung cấp và cải thiện dịch vụ quản lý tour du lịch</li>
                            <li>Xác thực danh tính và bảo mật tài khoản</li>
                            <li>Liên lạc về các cập nhật hệ thống và hỗ trợ kỹ thuật</li>
                            <li>Phân tích sử dụng để cải thiện trải nghiệm người dùng</li>
                            <li>Tuân thủ các yêu cầu pháp lý và quy định</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">3. Bảo vệ thông tin</h3>
                        <p>Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Mã hóa dữ liệu nhạy cảm bằng các tiêu chuẩn bảo mật cao</li>
                            <li>Kiểm soát truy cập nghiêm ngặt với hệ thống phân quyền</li>
                            <li>Sao lưu dữ liệu định kỳ và bảo mật</li>
                            <li>Giám sát hệ thống 24/7 để phát hiện các hoạt động bất thường</li>
                            <li>Đào tạo nhân viên về bảo mật thông tin</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">4. Chia sẻ thông tin</h3>
                        <p>Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân với bên thứ ba, trừ các trường hợp:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Có sự đồng ý rõ ràng từ người dùng</li>
                            <li>Yêu cầu của cơ quan pháp luật có thẩm quyền</li>
                            <li>Bảo vệ quyền lợi và an toàn của chúng tôi và người dùng khác</li>
                            <li>Với các đối tác dịch vụ đã ký thỏa thuận bảo mật</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">5. Quyền của người dùng</h3>
                        <p>Bạn có quyền:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Truy cập và xem thông tin cá nhân được lưu trữ</li>
                            <li>Yêu cầu sửa đổi hoặc cập nhật thông tin không chính xác</li>
                            <li>Yêu cầu xóa thông tin cá nhân (theo quy định pháp luật)</li>
                            <li>Rút lại sự đồng ý xử lý dữ liệu</li>
                            <li>Khiếu nại về việc xử lý dữ liệu cá nhân</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-gray-900">6. Liên hệ</h3>
                        <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:</p>
                        <div className="bg-gray-50 p-4 rounded-md mt-2">
                            <p><strong>Email:</strong> privacy@tourmanagement.vn</p>
                            <p><strong>Điện thoại:</strong> (84) 123 456 789</p>
                            <p><strong>Địa chỉ:</strong> 123 Đường ABC, Quận 1, TP.HCM</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
