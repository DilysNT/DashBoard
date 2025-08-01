import ProfileImage from "@/assets/profile-image.jpg";
import ProductImage from "@/assets/product-image.jpg";
import {
    Home, Settings, Users, Building2, Map, LayoutGrid, MapPin, Package, ShoppingCart, CreditCard, Tag, 
    Hotel, Plane, Calendar, UserCheck, Briefcase, TrendingUp, BarChart3, Compass, Mountain
} from "lucide-react";

export const navbarLinks = [
    {
        title: "Quản lý",
        links: [
            {
                label: "Quản Lý Người Dùng",
                icon: Users,
                path: "/admin/customers",
                adminOnly: true,
            },
            {
                label: "Quản Lý Đại Lý",
                icon: Building2, 
                path: "/admin/agency",
                adminOnly: true,
            },
            {
                label: "Quản Lý Tours",
                icon: Plane, 
                path: "/admin/tours",
            },
            {
                label: "Quản Lý Đơn Hàng",
                icon: ShoppingCart, 
                path: "/admin/orders",
                adminOnly: true,
            },
            {
                label: "Quản Lý Thanh Toán",
                icon: CreditCard, 
                path: "/admin/payments",
                adminOnly: true,
            },
            {
                label: "Quản Lý Danh Mục",
                icon: LayoutGrid, 
                path: "/admin/categories",
            },
            {
                label: "Quản lý Điểm Đến",
                icon: Compass, 
                path: "/admin/locations",
            },
            {
                label: "Quản lý Địa điểm",
                icon: Mountain,
                path: "/admin/destinations",
            },
            {
                label: "Quản Lý Khách Sạn",
                icon: Hotel, 
                path: "/admin/hotels",
            },
            {
                label:"Quản Lý Dịch Vụ",
                icon: Package, 
                path: "/admin/services",
                subLinks: [
                {
                    label: "Dịch Vụ Bao Gồm",
                    icon: UserCheck,
                    path: "/admin/services/included",
                },
                {
                    label: "Dịch Vụ Loại Trừ",
                    icon: Package,
                    path: "/admin/services/excluded",
                },
             ]
            },
            // {
            //     label: "Quản Lý Khuyến Mãi",
            //     icon: Tag,
            //     path: "/admin/promotions",
            // },
            {
                label: "Quản Lý Hoa Hồng",
                icon: TrendingUp,
                path: "/admin/commissions",
                adminOnly: true,
            },
        ],
    },
    {
        title: "Chung",
        links: [
            {
                label: "Thống kê",
                icon: BarChart3,
                path: "/admin/",
            },
            {
                label: "Cài đặt",
                icon: Settings,
                path: "/admin/settings",
            },
        ],
    },
];



export const overviewData = [
    { name: "Jan", total: 1500 },
    { name: "Feb", total: 2000 },
    { name: "Mar", total: 1000 },
    { name: "Apr", total: 5000 },
    { name: "May", total: 2000 },
    { name: "Jun", total: 5900 },
    { name: "Jul", total: 2000 },
    { name: "Aug", total: 5500 },
    { name: "Sep", total: 2000 },
    { name: "Oct", total: 4000 },
    { name: "Nov", total: 1500 },
    { name: "Dec", total: 2500 },
];

export const recentSalesData = [
    { id: 1, name: "Olivia Martin", email: "olivia.martin@email.com", image: ProfileImage, total: 1500 },
    { id: 2, name: "James Smith", email: "james.smith@email.com", image: ProfileImage, total: 2000 },
    { id: 3, name: "Sophia Brown", email: "sophia.brown@email.com", image: ProfileImage, total: 4000 },
    { id: 4, name: "Noah Wilson", email: "noah.wilson@email.com", image: ProfileImage, total: 3000 },
    { id: 5, name: "Emma Jones", email: "emma.jones@email.com", image: ProfileImage, total: 2500 },
    { id: 6, name: "William Taylor", email: "william.taylor@email.com", image: ProfileImage, total: 4500 },
    { id: 7, name: "Isabella Johnson", email: "isabella.johnson@email.com", image: ProfileImage, total: 5300 },
];

export const topProducts = [
    { number: 1, name: "Du lịch Hà Giang", image: ProductImage, description: "Tour Hà Giang Cao Bằng 5 Ngày 4 Đêm...", price: 5190000, status: "Còn trống", rating: 4.5 },
    { number: 2, name: "Du lịch Đà Nẵng", image: ProductImage, description: "Khám phá bờ Tây Sông Hàn.", price: 799000, status: "Còn trống", rating: 4.7 },
    { number: 3, name: "Du lịch Huế", image: ProductImage, description: "Khám phá vẻ đẹp của cố đô Huế...", price: 1199000, status: "Còn trống", rating: 4.8 },
    { number: 4, name: "Du lịch Nha Trang", image: ProductImage, description: "Điểm chạm tâm linh...", price: 1499000, status: "Hết chỗ", rating: 4.4 },
    { number: 5, name: "Du lịch Bến Tre", image: ProductImage, description: "Khám phá vẻ đẹp của Bến Tre...", price: 599000, status: "Còn trống", rating: 4.3 },
    { number: 6, name: "Du lịch Huế", image: ProductImage, description: "Tham quan đại nội - Lăng Khải Định.", price: 890000, status: "Còn trống", rating: 4.6 },
    { number: 7, name: "Du lịch Cà Mau", image: ProductImage, description: "Khám phá vùng đất mũi Cà Mau...", price: 1090000, status: "Còn trống", rating: 4.7 },
    { number: 8, name: "Du lịch Phú Quốc", image: ProductImage, description: "Khám phá thiên đường nghỉ dưỡng...", price: 4390000, status: "Còn trống", rating: 4.9 },
    { number: 9, name: "Du lịch Cao Bằng", image: ProductImage, description: "Khám phá vẻ đẹp của Cao Bằng...", price: 3490000, status: "Còn trống", rating: 4.8 },
    { number: 10, name: "Du lịch Đà Lạt", image: ProductImage, description: "Khám phá thành phố ngàn hoa...", price: 2590000, status: "Hết chỗ", rating: 4.6 },
];