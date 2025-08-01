import { forwardRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { navbarLinks } from "@/constants";
import { useAuth } from "@/contexts/auth-context";

import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";

import { cn } from "@/utils/cn";

import PropTypes from "prop-types";

export const Sidebar = forwardRef(({ collapsed, setCollapsed }, ref) => {
    const { isAdmin } = useAuth();
    const [openMenus, setOpenMenus] = useState({});
    const handleToggleMenu = (label) => {
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };
    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms_cubic-bezier(0.4,_0,_0.2,_1),_background-color_150ms_cubic-bezier(0.4,_0,_0.2,_1),_border_150ms_cubic-bezier(0.4,_0,_0.2,_1)] dark:border-slate-700 dark:bg-slate-900",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            <div className="flex gap-x-3 p-3 items-center justify-between">
                <div className="flex gap-x-3 items-center">
                    <img
                        src={logoLight}
                        alt="TravelTour"
                        className="dark:hidden"
                    />
                    <img
                        src={logoDark}
                        alt="TravelTour"
                        className="hidden dark:block"
                    />
                    {!collapsed && <p className="text-lg font-medium text-slate-900 transition-colors dark:text-slate-50">TravelTour DashBoard</p>}
                </div>
                {/* Nút toggle đóng/mở sidebar */}
                <button onClick={() => setCollapsed(!collapsed)} className="ml-2 p-1 rounded hover:bg-slate-200">
                    <ChevronRight className={collapsed ? "rotate-180" : ""} />
                </button>
            </div>
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {navbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        <p className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}>{navbarLink.title}</p>
                        {navbarLink.links.map((link) => {
                            // Only show admin-specific links to admin users
                            if (link.adminOnly && !isAdmin()) {
                                return null;
                            }
                            return link.subLinks ? (
                                <div key={link.label}>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleMenu(link.label)}
                                        className={cn("sidebar-item w-full text-left flex items-center", collapsed && "md:w-[45px]")}
                                    >
                                        <ChevronRight size={22} className={cn("flex-shrink-0 transition-transform", openMenus[link.label] ? "rotate-90" : "")}/>
                                        {!collapsed && <span className="whitespace-nowrap flex-1">{link.label}</span>}
                                    </button>
                                    {openMenus[link.label] && !collapsed && (
                                        <div className="ml-8 flex flex-col gap-y-2">
                                            {link.subLinks.map((subLink) => (
                                                <NavLink
                                                    key={subLink.label}
                                                    to={subLink.path}
                                                    end
                                                    className="sidebar-item text-sm opacity-80"
                                                >
                                                    <subLink.icon size={18} className="flex-shrink-0 mr-2" />
                                                    <span>{subLink.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={link.label}
                                    to={link.path}
                                    end
                                    className={cn("sidebar-item", collapsed && "md:w-[45px]")}
                                >
                                    <link.icon size={22} className="flex-shrink-0" />
                                    {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                                </NavLink>
                            );
                        })}
                    </nav>
                ))}
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
