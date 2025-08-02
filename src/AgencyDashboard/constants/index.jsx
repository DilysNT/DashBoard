import {
    Home, Settings, Map, Plane, Route,
    CalendarClock, Calendar,
    ShoppingCart, Package,
    CreditCard, Wallet,
    Star, MessageSquare,
    Tag, Percent,
    TrendingUp, DollarSign,
    X, UserCheck
} from "lucide-react";

import ProfileImage from "@/assets/profile-image.jpg";
import ProductImage from "@/assets/product-image.jpg";
import path from "path";

export const navbarLinks = [
    {
        title: "Quản lý",
        links: [
            {
                label: "Quản Lý Tour",
                icon: Plane, // Thay Map thành Plane cho phù hợp với tour du lịch
                path: "/agency/tours",
            },
            {
                label: "Quản Lý Lịch Trình",
                icon: Route, // Thay CalendarClock thành Route cho lịch trình tour
                path: "/agency/itineraries",
            },
            {
                label: "Ngày Khởi Hành",
                icon: Calendar, // Thay CalendarClock thành Calendar đơn giản hơn
                path: "/agency/departure-dates",
            },
            {
                label: "Quản Lý Đơn Hàng",
                icon: ShoppingCart, // Giữ nguyên
                path: "/agency/orders",
            },
            {
                label: "Quản Lý Thanh Toán",
                icon: Wallet, // Thay CreditCard thành Wallet cho phù hợp hơn
                path: "/agency/payments",
            },
            {
                label: "Quản Lý Đánh Giá",
                icon: MessageSquare, // Thay Star thành MessageSquare cho đánh giá
                path: "/agency/reviews",
            },
            {
                label: "Quản Lý Mã Giảm Giá",
                icon: Percent, // Thay Star thành Percent cho giảm giá
                path: "/agency/discounts",
            },
            {
                label: "Quản Lý Hoa Hồng",
                icon: TrendingUp, 
                path: "/agency/commissions",
            },
            {
                label: "Quản Lý Hoàn Tiền",
                icon: DollarSign,
                path: "/agency/refunds",
            }
        ],
    },
    {
        title: "Chung",
        links: [
            {
                label: "Dashboard",
                icon: Home, // Giữ nguyên
                path: "/agency",
            },
            {
                label: "Cài Đặt",
                icon: Settings, // Giữ nguyên
                path: "/agency/settings",
            },
        ],
    },
];

// Thêm constants cho commission management
export const commissionStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    CANCELLED: 'cancelled'
};

export const commissionTypes = {
    BOOKING: 'booking',
    PAYMENT: 'payment',
    REFUND: 'refund'
};

// Commission API endpoints cho agency
export const commissionEndpoints = {
    HISTORY: '/api/dashboard/commissions/agency/history',
    OVERVIEW: '/api/dashboard/commissions/agency/overview',
    DETAILS: '/api/dashboard/commissions/agency/details',
    WITHDRAW: '/api/dashboard/commissions/agency/withdraw'
};

// Service types cho tour (để khắc phục vấn đề excluded services)
export const serviceTypes = {
    INCLUDED: 'included',
    EXCLUDED: 'excluded'
};

// Tour form validation cho excluded services
export const tourValidationRules = {
    includedServices: {
        required: false,
        type: 'array',
        message: 'Vui lòng chọn dịch vụ bao gồm'
    },
    excludedServices: {
        required: false,
        type: 'array',
        message: 'Vui lòng chọn dịch vụ loại trừ'
    }
};

export const overviewData = [
    {
        name: "Jan",
        total: 1500,
    },
    {
        name: "Feb",
        total: 2000,
    },
    {
        name: "Mar",
        total: 1000,
    },
    {
        name: "Apr",
        total: 5000,
    },
    {
        name: "May",
        total: 2000,
    },
    {
        name: "Jun",
        total: 5900,
    },
    {
        name: "Jul",
        total: 2000,
    },
    {
        name: "Aug",
        total: 5500,
    },
    {
        name: "Sep",
        total: 2000,
    },
    {
        name: "Oct",
        total: 4000,
    },
    {
        name: "Nov",
        total: 1500,
    },
    {
        name: "Dec",
        total: 2500,
    },
];

export const recentSalesData = [
    {
        id: 1,
        name: "Olivia Martin",
        email: "olivia.martin@email.com",
        image: ProfileImage,
        total: 1500,
    },
    {
        id: 2,
        name: "James Smith",
        email: "james.smith@email.com",
        image: ProfileImage,
        total: 2000,
    },
    {
        id: 3,
        name: "Sophia Brown",
        email: "sophia.brown@email.com",
        image: ProfileImage,
        total: 4000,
    },
    {
        id: 4,
        name: "Noah Wilson",
        email: "noah.wilson@email.com",
        image: ProfileImage,
        total: 3000,
    },
    {
        id: 5,
        name: "Emma Jones",
        email: "emma.jones@email.com",
        image: ProfileImage,
        total: 2500,
    },
    {
        id: 6,
        name: "William Taylor",
        email: "william.taylor@email.com",
        image: ProfileImage,
        total: 4500,
    },
    {
        id: 7,
        name: "Isabella Johnson",
        email: "isabella.johnson@email.com",
        image: ProfileImage,
        total: 5300,
    },
];

export const topProducts = [
    {
        number: 1,
        name: "Du lịch Hà Giang",
        image: ProductImage,
        description: "Tour Hà Giang Cao Bằng 5 Ngày 4 Đêm khởi hành từ Hà Nội sẽ mang đến cho quý khách những trải nghiệm không thể nào quên tại vòng cung Đông Bắc Tổ Quốc",
        price: 5190000,
        status: "Còn trống",
        rating: 4.5,
    },
    {
        number: 2,
        name: "Du lịch Đà Nẵng",
        image: ProductImage,
        description: "Khám phá bờ Tây Sông Hàn.",
        price: 799000,
        status: "Còn trống",
        rating: 4.7,
    },
    {
        number: 3,
        name: "Du lịch Huế",
        image: ProductImage,
        description: "Khám phá vẻ đẹp của cố đô Huế, nét đẹp Chốn Kinh Kỳ!.",
        price: 1199000,
        status: "Còn trống",
        rating: 4.8,
    },
    {
        number: 4,
        name: "Du lịch Nha Trang",
        image: ProductImage,
        description: "Điểm chạm tâm linh giữa lòng phố biển.",
        price: 1499000,
        status: "Hết chỗ",
        rating: 4.4,
    },
    {
        number: 5,
        name: "Du lịch Bến Tre",
        image: ProductImage,
        description: "Khám phá vẻ đẹp của Bến Tre, xứ sở của dừa.",
        price: 599000,
        status: "Còn trống",
        rating: 4.3,
    },
    {
        number: 6,
        name: "Du lịch Huế",
        image: ProductImage,
        description: "Tham quan đại nội - Lăng Khải Định.",
        price: 890000,
        status: "Còn trống",
        rating: 4.6,
    },
    {
        number: 7,
        name: "Du lịch Cà Mau",
        image: ProductImage,
        description: "Khám phá vùng đất mũi Cà Mau, chinh phục điểm cực nam tổ quốc.",
        price: 1090000,
        status: "Còn trống",
        rating: 4.7,
    },
    {
        number: 8,
        name: "Du lịch Phú Quốc",
        image: ProductImage,
        description: "Khám phá thiên đường nghỉ dưỡng tại Phú Quốc.",
        price: 4390000,
        status: "Còn trống",
        rating: 4.9,
    },
    {
        number: 9,
        name: "Du lịch Cao Bằng",
        image: ProductImage,
        description: "Khám phá vẻ đẹp của Cao Bằng, nơi có thác Bản Giốc hùng vĩ.",
        price: 3490000,
        status: "Còn trống",
        rating: 4.8,
    },
    {
        number: 10,
        name: "Du lịch Đà Lạt",
        image: ProductImage,
        description: "Khám phá thành phố ngàn hoa Đà Lạt.",
        price: 2590000,
        status: "Hết chỗ",
        rating: 4.6,
    },
];
