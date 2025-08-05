<br />
<div align="center">
    <img src="public/favicon-light.svg" style="vertical-align: middle;" width="48" height="48"/>
    <br />
    <br />
    <p>
        Hệ thống quản lý đặt tour du lịch - Dashboard hiện đại cho các công ty du lịch và quản trị viên
    </p>
</div>

<br />

![Dashboard UI Design](./public/Dashboard%20UI%20Design.png)

## 🗒️ Mục lục

1. [💬 Giới thiệu](#introduction)
2. [🏗️ Kiến trúc hệ thống](#architecture)
3. [🛠️ Công nghệ sử dụng](#technologies)
4. [✨ Tính năng](#features)
5. [🔗 API Endpoints](#api-endpoints)
6. [🚀 Hướng dẫn cài đặt](#getting-started)
7. [📁 Cấu trúc dự án](#project-structure)
8. [🔄 Quy trình nghiệp vụ](#business-flows)
9. [🔐 Xác thực & Phân quyền](#auth)
10. [📱 Thiết kế responsive](#responsive)

## <a name="introduction">💬 Giới thiệu</a>

Đây là hệ thống quản lý đặt tour du lịch toàn diện được xây dựng bằng React.js và các công nghệ web hiện đại. Hệ thống cung cấp dashboard riêng biệt cho quản trị viên và các công ty du lịch để quản lý tours, đặt chỗ, thanh toán và quan hệ khách hàng. Nền tảng hỗ trợ quản lý toàn bộ vòng đời tour từ tạo mới đến hoàn thành đặt chỗ với xử lý thanh toán tích hợp.

## <a name="architecture">🏗️ Kiến trúc hệ thống</a>

Hệ thống tuân theo kiến trúc module với sự phân tách rõ ràng giữa chức năng Admin và Agency:

### Hệ thống Dashboard đa vai trò
- **Admin Dashboard** (`/admin/*`): Quản lý hệ thống hoàn chỉnh cho quản trị viên
- **Agency Dashboard** (`/agency/*`): Giao diện quản lý tour cho các công ty du lịch
- **Xác thực dựa trên vai trò**: Xác thực JWT với kiểm soát truy cập theo vai trò

### Kiến trúc Frontend
- **Cấu trúc dựa trên Component**: Các component React có thể tái sử dụng với phân tách rõ ràng
- **Quản lý state theo Context**: Context cho Theme, Authentication và Notification
- **Pattern Service Layer**: Các class service chuyên dụng cho giao tiếp API
- **Hệ thống Protected Route**: Bảo vệ route và điều hướng dựa trên vai trò

## <a name="technologies">🛠️ Công nghệ sử dụng</a>

### Công nghệ cốt lõi
-   **[React 18.3.1](https://react.dev)** - React hiện đại với Hooks và Concurrent Features
-   **[Vite 6.3.5](https://vitejs.dev)** - Công cụ Frontend thế hệ mới
-   **[TailwindCSS 3.4.11](https://tailwindcss.com/)** - Framework CSS utility-first
-   **[React Router 6.26.2](https://reactrouter.com/en/main)** - Định tuyến khai báo

### UI & Styling
-   **[Lucide React 0.441.0](https://lucide.dev/)** - Bộ icon đẹp & nhất quán
-   **[Tailwind Merge 2.5.2](https://github.com/dcastil/tailwind-merge)** - Tiện ích gộp Tailwind classes
-   **[clsx 2.1.1](https://github.com/lukeed/clsx)** - Tiện ích xây dựng className strings

### Trực quan hóa dữ liệu & Biểu đồ
-   **[Recharts 2.12.7](https://recharts.org/en-US/)** - Thư viện biểu đồ tái định nghĩa với React và D3

### Giao tiếp API
-   **[Axios 1.10.0](https://axios-http.com/)** - HTTP client dựa trên Promise
-   **Fetch API** - API HTTP gốc của trình duyệt

### Xử lý Form & UI Components
-   **[React Select 5.10.2](https://react-select.com/)** - Điều khiển Select Input linh hoạt
-   **[Date-fns 4.1.0](https://date-fns.org/)** - Thư viện tiện ích ngày tháng JavaScript hiện đại

### Xác thực & Lưu trữ
-   **[Firebase 11.10.0](https://firebase.google.com/)** - Nền tảng Backend-as-a-Service
-   **Local Storage** - Lưu trữ dữ liệu phía client
-   **JWT Tokens** - Cơ chế xác thực bảo mật

### Công cụ phát triển
-   **[ESLint 9.9.0](https://eslint.org/)** - Tiện ích linting JavaScript
-   **[Prettier 3.3.3](https://prettier.io/)** - Công cụ format code
-   **[PostCSS 8.4.47](https://postcss.org/)** - Công cụ biến đổi CSS

### Tiện ích & Hooks
-   **[@uidotdev/usehooks 2.4.1](https://usehooks.com/)** - Bộ sưu tập React Hooks

## <a name="features">✨ Tính năng</a>

### 🔐 Xác thực & Quản lý người dùng
- **Xác thực đa vai trò**: Truy cập dựa trên vai trò Admin và Agency
- **Quản lý JWT Token**: Xác thực bảo mật với làm mới token tự động
- **Protected Routes**: Điều hướng và kiểm soát truy cập theo vai trò
- **Quản lý hồ sơ người dùng**: Quản lý thông tin người dùng hoàn chỉnh

### 👨‍💼 Tính năng Admin Dashboard
- **🏢 Quản lý Agency**: Tạo, chỉnh sửa và quản lý các công ty du lịch
- **🎯 Quản lý Tour**: Quản lý toàn bộ vòng đời tour
- **📊 Dashboard Analytics**: Phân tích doanh thu, đặt chỗ và hiệu suất
- **👥 Quản lý khách hàng**: Thông tin khách hàng và lịch sử đặt chỗ
- **🏨 Quản lý khách sạn**: Thông tin khách sạn và quản lý vị trí
- **📍 Quản lý địa điểm & điểm đến**: Quản lý dữ liệu địa lý
- **🎫 Quản lý danh mục**: Tổ chức danh mục tour
- **💰 Quản lý thanh toán**: Giám sát và xử lý giao dịch
- **📝 Quản lý đặt chỗ**: Xử lý đơn hàng và trạng thái
- **🎁 Quản lý khuyến mãi**: Chiến dịch giảm giá và khuyến mãi
- **💼 Quản lý hoa hồng**: Theo dõi hoa hồng của agency
- **💸 Quản lý hoàn tiền**: Xử lý yêu cầu hoàn tiền

### 🏢 Tính năng Agency Dashboard
- **🎯 Tạo & Quản lý Tour**: Tạo tour nhiều bước với upload hình ảnh
- **📅 Quản lý hành trình**: Lập kế hoạch tour chi tiết theo ngày
- **🗓️ Quản lý ngày khởi hành**: Quản lý lịch trình cho tours
- **📋 Quản lý đặt chỗ**: Theo dõi và quản lý đặt chỗ của khách hàng
- **💰 Theo dõi thanh toán**: Giám sát trạng thái thanh toán và doanh thu
- **⭐ Quản lý đánh giá**: Phản hồi và rating của khách hàng
- **💼 Theo dõi hoa hồng**: Giám sát thu nhập và hoa hồng
- **🎁 Quản lý giảm giá**: Tạo và quản lý ưu đãi khuyến mãi
- **💸 Xử lý hoàn tiền**: Xử lý yêu cầu hoàn tiền

### 📊 Trực quan hóa dữ liệu
- **Biểu đồ doanh thu**: Biểu đồ đường và cột cho theo dõi doanh thu
- **Phân tích đặt chỗ**: Xu hướng và thống kê đặt chỗ
- **Chỉ số hiệu suất**: Dashboard KPI với dữ liệu thời gian thực
- **Báo cáo hoa hồng**: Phân tích hoa hồng chi tiết

### 🎨 Tính năng UI/UX
- **Thiết kế responsive**: Tiếp cận mobile-first với responsive hoàn toàn
- **Theme sáng/tối**: Chuyển đổi theme với tùy chọn lưu trữ
- **Toast Notifications**: Phản hồi thời gian thực cho hành động người dùng
- **Loading States**: Skeleton loading và chỉ báo tiến trình
- **Hệ thống Modal**: Form nhiều bước phức tạp và xác nhận
- **Phân trang**: Điều hướng dữ liệu hiệu quả với kích thước trang tùy chỉnh
- **Tìm kiếm & Lọc**: Khả năng lọc và tìm kiếm nâng cao

### 🔄 Tính năng quy trình nghiệp vụ
- **Quy trình phê duyệt Tour**: Quy trình phê duyệt nhiều giai đoạn cho tours
- **Tích hợp thanh toán**: Quy trình xử lý thanh toán bảo mật
- **Quản lý hình ảnh**: Tích hợp Cloudinary cho upload và quản lý hình ảnh
- **Xuất dữ liệu**: Chức năng xuất cho báo cáo và analytics
- **Cập nhật thời gian thực**: Đồng bộ dữ liệu live qua các dashboard

## <a name="api-endpoints">🔗 API Endpoints</a>

**Base URL**: `http://localhost:5000/api`

### 🔐 Xác thực
- `POST /auth/login` - Xác thực người dùng
- `GET /agency/by-user/{userId}` - Lấy agency theo user ID

### 👨‍💼 Admin Endpoints

#### Dashboard & Analytics
- `GET /admin/bookings/stats` - Thống kê đặt chỗ
- `GET /admin/payments/stats` - Thống kê thanh toán  
- `GET /admin/tours/stats` - Thống kê tour
- `GET /admin/bookings/revenue` - Doanh thu từ đặt chỗ
- `GET /admin/payments/revenue` - Doanh thu thanh toán
- `GET /dashboard/commissions/admin/overview` - Tổng quan hoa hồng

#### Quản lý dữ liệu
- `GET /agencies` - Danh sách tất cả agencies
- `GET /bookings` - Danh sách tất cả đặt chỗ
- `PUT /bookings/{id}/status` - Cập nhật trạng thái đặt chỗ
- `GET /hotels` - Danh sách tất cả khách sạn
- `POST /hotels` - Tạo khách sạn mới
- `PUT /hotels/{id}` - Cập nhật khách sạn
- `DELETE /hotels/{id}` - Xóa khách sạn
- `GET /hotel-locations` - Ánh xạ vị trí khách sạn
- `PUT /hotel-locations/{id}/location` - Cập nhật vị trí khách sạn
- `GET /locations` - Danh sách tất cả vị trí
- `GET /payments` - Danh sách tất cả thanh toán

### 🏢 Agency Endpoints

#### Dashboard
- `GET /agency/bookings/top-tours` - Top tours hiệu suất cao
- `GET /agency/commissions` - Dữ liệu hoa hồng
- `GET /agency/commissions/stats` - Thống kê hoa hồng
- `PUT /agency/commissions/{id}` - Cập nhật hoa hồng
- `GET /agency/commissions/export` - Xuất dữ liệu hoa hồng

#### Quản lý Tour
- `GET /tours` - Danh sách tours (với bộ lọc agency)
- `POST /tours` - Tạo tour mới
- `PUT /tours/{id}` - Cập nhật tour
- `DELETE /tours/{id}` - Xóa tour
- `GET /tours/{id}/complete` - Lấy chi tiết tour hoàn chỉnh
- `POST /tours/submit-for-approval/{id}` - Gửi tour để phê duyệt

#### Dữ liệu hỗ trợ
- `GET /included-services` - Dịch vụ bao gồm trong tours
- `GET /excluded-services` - Dịch vụ loại trừ khỏi tours
- `GET /tour-categories` - Danh mục tour
- `GET /destinations` - Điểm đến có sẵn
- `GET /departure-dates` - Ngày khởi hành có sẵn
- `GET /hotel-locations/location/{locationId}` - Khách sạn theo vị trí

#### Quản lý hành trình
- `GET /itineraries` - Danh sách hành trình
- `POST /itineraries` - Tạo hành trình
- `PUT /itineraries/{id}` - Cập nhật hành trình
- `DELETE /itineraries/{id}` - Xóa hành trình
- `POST /itineraries/{id}/locations` - Thêm vị trí vào hành trình
- `DELETE /itineraries/{id}/locations` - Xóa vị trí khỏi hành trình

#### Ngày khởi hành
- `GET /departure-dates` - Danh sách ngày khởi hành
- `POST /departure-dates` - Tạo ngày khởi hành
- `PUT /departure-dates/{id}` - Cập nhật ngày khởi hành
- `DELETE /departure-dates/{id}` - Xóa ngày khởi hành

### 🔄 Mối quan hệ dữ liệu
- Tours → Categories (Many-to-Many)
- Tours → Hotels (Many-to-Many)
- Tours → Included/Excluded Services (Many-to-Many)
- Tours → Locations (Many-to-Many)
- Tours → Departure Dates (One-to-Many)
- Tours → Itineraries (One-to-Many)
- Itineraries → Locations (Many-to-Many)
- Agencies → Tours (One-to-Many)
- Users → Agencies (One-to-One)

## <a name="getting-started">🚀 Hướng dẫn cài đặt</a>

### Yêu cầu hệ thống
- **Node.js** (v16 trở lên)
- **npm** hoặc **yarn** package manager
- **Git** cho version control

### Các bước cài đặt

#### 1. Clone Repository
```bash
git clone https://github.com/DilysNT/Dashboard.git
cd Dashboard
```
<a name="business-flows">🔄 Quy trình nghiệp vụ</a>
🎯 Quy trình quản lý Tour (Agency)
Tạo Tour

Form nhiều bước với validation
Upload hình ảnh lên Cloudinary
Chọn vị trí và khách sạn
Cấu hình dịch vụ (bao gồm/loại trừ)
Gán danh mục
Quy trình phê duyệt Tour

Nháp → Gửi phê duyệt → Đang xem xét → Được duyệt/Từ chối
Kiểm tra validation cho các trường bắt buộc (ngày khởi hành, hành trình)
Toast notifications cho cập nhật trạng thái
Quản lý hành trình

Lập kế hoạch theo ngày
Tạo hành trình dựa trên vị trí
Lọc vị trí động dựa trên vị trí tour
📋 Quy trình quản lý đặt chỗ
Xử lý đơn hàng

Tạo đặt chỗ khách hàng
Tích hợp xử lý thanh toán
Theo dõi trạng thái (Chờ xử lý → Xác nhận → Hoàn thành → Hủy)
Thông báo email
Quy trình thanh toán

Xử lý thanh toán bảo mật
Giám sát trạng thái giao dịch
Khả năng xử lý hoàn tiền
Tính toán hoa hồng
💼 Quản lý hoa hồng
Tính toán hoa hồng
Tính hoa hồng tự động dựa trên đặt chỗ
Theo dõi hoa hồng thời gian thực
Chức năng xuất cho báo cáo tài chính
Quản lý trạng thái thanh toán
🔐 Quy trình xác thực
Quy trình đăng nhập

Xác thực dựa trên JWT token
Chuyển hướng dựa trên vai trò (Admin → /admin/, Agency → /agency/)
Lưu trữ token trong localStorage
Làm mới token tự động
Phân quyền

Triển khai protected route
Kiểm soát truy cập dựa trên vai trò
Headers xác thực yêu cầu API
<a name="auth">🔐 Xác thực & Phân quyền</a>
Quản lý JWT Token
Lưu trữ Token: localStorage với cleanup tự động
Validation Token: Xử lý hết hạn tự động
Truy cập dựa trên vai trò: Phân biệt vai trò Admin và Agency
Protected Routes: Phân quyền cấp route
Vai trò người dùng & Quyền hạn
👨‍💼 Vai trò Admin
Truy cập hệ thống đầy đủ
Quản lý agency
Quản lý tour toàn cục
Analytics và báo cáo hệ thống
Giám sát thanh toán và hoa hồng
Quản lý khách hàng
🏢 Vai trò Agency
Quản lý tour riêng
Quản lý đặt chỗ cho tour riêng
Tạo và quản lý hành trình
Theo dõi hoa hồng
Quản lý đánh giá khách hàng
Quản lý giảm giá khuyến mãi
<a name="responsive">📱 Thiết kế responsive</a>
Tiếp cận Mobile-First
Chiến lược Breakpoint: Tiện ích responsive Tailwind CSS
Điều hướng: Sidebar có thể thu gọn cho thiết bị di động
Bảng: Cuộn ngang cho bảng dữ liệu trên màn hình nhỏ
Modals: Modal toàn màn hình trên thiết bị di động
Biểu đồ: Scaling biểu đồ responsive với Recharts
Tương thích đa thiết bị
Desktop: Truy cập tính năng đầy đủ với layout tối ưu
Tablet: Layout thích ứng với giao diện thân thiện với cảm ứng
Mobile: Giao diện tinh gọn với các tính năng thiết yếu
Hỗ trợ cảm ứng: Tương tác và cử chỉ tối ưu cho cảm ứng
Tối ưu hiệu suất
Lazy Loading: Code splitting dựa trên component
Tối ưu hình ảnh: Tích hợp Cloudinary cho hình ảnh responsive
Tối ưu Bundle: Tối ưu build dựa trên Vite
Chiến lược Caching: Caching phản hồi API hiệu quả
🚀 Triển khai
Production Build

npm run build

Biến môi trường (Production)
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_FIREBASE_API_KEY=production_firebase_key
VITE_CLOUDINARY_CLOUD_NAME=production_cloudinary_name

Đề xuất Hosting
Frontend: Vercel, Netlify, hoặc AWS S3 + CloudFront
Backend: Node.js server trên AWS EC2, Digital Ocean, hoặc Heroku
Database: PostgreSQL hoặc MySQL với indexing phù hợp
CDN: Cloudinary cho quản lý hình ảnh

 Hướng dẫn phát triển
Tiêu chuẩn Code
ESLint: Thực thi chất lượng code nhất quán
Prettier: Format code tự động
Cấu trúc Component: Functional components với hooks
Quản lý State: Context API cho global state
Quy trình Git
Feature Branches: Phát triển tính năng riêng lẻ
Pull Requests: Quy trình review code
Tiêu chuẩn Commit: Thông điệp commit theo quy ước
Quản lý Release: Semantic versioning
📊 Chỉ số hiệu suất
Core Web Vitals
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms
CLS (Cumulative Layout Shift): < 0.1
Phân tích Bundle
Kích thước Bundle ban đầu: Tối ưu với code splitting
Chunk Loading: Dynamic imports cho splitting dựa trên route
Tối ưu Asset: Nén hình ảnh và fonts
🤝 Đóng góp
Hướng dẫn đóng góp
Fork dự án
Tạo feature branch (git checkout -b feature/AmazingFeature)
Commit thay đổi (git commit -m 'Add some AmazingFeature')
Push lên branch (git push origin feature/AmazingFeature)
Mở Pull Request
Báo cáo lỗi
Sử dụng GitHub Issues để báo cáo bugs
Cung cấp thông tin chi tiết về lỗi
Bao gồm các bước tái tạo lỗi

Báo cáo lỗi
Sử dụng GitHub Issues để báo cáo bugs
Cung cấp thông tin chi tiết về lỗi
Bao gồm các bước tái tạo lỗi
📄 Giấy phép
Dự án này được phân phối theo giấy phép MIT. Xem file LICENSE để biết thêm thông tin.

👥 Tác giả
DilysNT - Phát triển chính - GitHub
🙏 Lời cảm ơn
React Team cho framework tuyệt vời
Tailwind CSS cho hệ thống design
Cộng đồng open source cho các thư viện hỗ trợ