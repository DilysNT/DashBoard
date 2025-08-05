import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/contexts/auth-context";
import { NotificationProvider } from "@/contexts/notification-context";
import Layout from "@/routes/layout";
import LayoutAgency from "@/AgencyDashboard/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import CustomerPage from "@/routes/customers/page";
import AgencyManagementPage from "@/routes/agency/page";
import SettingsPage from "@/routes/settings/page";
import ToursPage from "@/routes/tours/page";    
import CategoryManagementPage from "@/routes/categories/page";
import LocationManagementPage from "./routes/locations/page";
import PromotionManagementPage from "./routes/promotions/page";
import HotelManagementPage from "./routes/hotels/page";
import ExcludedServicesPage from "./routes/excluded/page";
import IncludedServicesPage from "./routes/included/page";
import DestinationManagementPage from "./routes/destinatons/page";
import AdminOrderManagementPage from "./routes/order/page";
import ErrorBoundary from "./components/ErrorBoundary";
import ToursPageManagement from "./AgencyDashboard/routes/tours/page";
import ItineraryManagementPage from "./AgencyDashboard/routes/itinerarys/page";
import DepartureManagementPage from "./AgencyDashboard/routes/departures/page";
import BookingManagementPage from "./AgencyDashboard/routes/orders/page";
import ReviewManagementPage from "./AgencyDashboard/routes/reviews/page";
import DashboardPageAgency from "./AgencyDashboard/routes/dashboard/page";
import LoginPage from "./routes/login/page";
import ProtectedRoute from "./components/ProtectedRoute";
import OederPage from "./routes/order/page";
import AdminPaymentManagementPage from "./routes/payments/page";
import CommissionAdminPage from "./routes/commissions/page";
import PaymentManagementPage from "./AgencyDashboard/routes/payments/page";
import PromotionManagementPageAgency from "./AgencyDashboard/routes/discounts/page";
import AgencyCommissionPage from "./AgencyDashboard/routes/commision/page";
import RefundManagementPage from "./AgencyDashboard/routes/refund/page";
import RefundAdminPage from "./routes/refund/page";

function App() {
    const router = createBrowserRouter([
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/admin/",
            element: (
                <ProtectedRoute requiredRole="admin">
                    <Layout />
                </ProtectedRoute>
            ),
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "customers",
                    element: <ErrorBoundary><CustomerPage /></ErrorBoundary>,
                },
                {
                    path: "agency",
                    element: <AgencyManagementPage />,
                },
                {
                    path: "tours",
                    element: <ToursPage />, 
                },
                {
                    path: "categories",
                    element: <CategoryManagementPage/>, 
                },
                {
                    path: "destinations",
                    element: <DestinationManagementPage />, 
                },
                {
                    path: "locations",
                    element: <LocationManagementPage />,
                },
                 {
                    path: "hotels",
                    element: <HotelManagementPage />,
                },
                {
                    path: "services/included",
                    element: <IncludedServicesPage/>,
                },
                {
                    path: "services/excluded",
                    element: <ExcludedServicesPage/>,
                },
                 {
                    path: "promotions",
                    element: <PromotionManagementPage/>, 
                },
                {
                    path: "commissions",
                    element: <CommissionAdminPage/>,
                },
                {
                    path: "orders",
                    element: <ErrorBoundary><AdminOrderManagementPage/></ErrorBoundary>, 
                },
                {
                    path: "payments",
                    element: <ErrorBoundary><AdminPaymentManagementPage/></ErrorBoundary>,
                },
                {
                    path: "refunds",
                    element: <RefundManagementPage />,
                },
    
                {
                    path: "settings",
                    element: <SettingsPage />,
                },
            ],
        },
        {
            path: "/agency/",
            element: (
                <ProtectedRoute requiredRole="agency">
                    <LayoutAgency />
                </ProtectedRoute>
            ),
            children: [
                {
                    index: true,
                    element: <DashboardPageAgency />,
                },
                {
                    path: "tours",
                    element: <ToursPageManagement />,
                },
                {
                    path: "itineraries",
                    element: <ItineraryManagementPage />,
                },
                 {
                    path: "departure-dates",
                    element: <DepartureManagementPage />,
                },
                {
                    path: "orders",
                    element: <BookingManagementPage/>,
                },
        
                {
                    path: "reviews",
                    element: <ReviewManagementPage/>,
                },
                {
                    path: "commissions",
                    element: <AgencyCommissionPage />,
                },
                {
                    path: "settings",
                    element: <SettingsPage />,
                },
                {
                    path: "payments",
                    element: <PaymentManagementPage />,
                },
                {
                    path: "discounts",
                    element: <ErrorBoundary><PromotionManagementPageAgency /></ErrorBoundary>,
                },
                {
                    path: "refunds",
                    element: <RefundManagementPage />,
                }
            ],
        },
        {
            path: "/",
            element: <Navigate to="/login" replace />,
        },
    ]);
    return (
        <AuthProvider>
            <ThemeProvider storageKey="theme">
                <NotificationProvider>
                    <RouterProvider router={router} />
                </NotificationProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
// Ensure default export exists
// If App is your main component, export it as default
// If you already have: export default App; at the end, this is fine.
// If not, add the following at the end of the file:
// export default App;

// If your main component is named something else, export it as default:
// export default YourMainComponent;

export default App;