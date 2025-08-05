import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";
import NotificationDropdown from "@/components/NotificationDropdown";

import { Bell, ChevronsLeft, Moon, Search, Sun, LogOut, User } from "lucide-react";

import PropTypes from "prop-types";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
            
            </div>
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block"
                    />
                </button>
                <NotificationDropdown />
                <div className="relative group">
                    <button className="btn-ghost size-10">
                        <User size={20} />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            <div className="font-medium">{user?.username || user?.email}</div>
                            <div className="text-gray-500 capitalize">{user?.role}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                            <LogOut size={16} className="mr-2" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
